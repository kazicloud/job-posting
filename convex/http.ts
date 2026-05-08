import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { handleClerkWebhook, saveSignupData } from "./clerk";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk",
  method: "POST",
  handler: handleClerkWebhook,
});

http.route({
  path: "/signup-data",
  method: "POST",
  handler: saveSignupData,
});

// ── Svix webhook signature verification (Resend uses Svix) ───────────────────
// https://docs.svix.com/receiving/verifying-payloads/how-manual
async function verifySvixSignature(
  body: string,
  headers: Headers,
  secret: string
): Promise<boolean> {
  const msgId = headers.get("svix-id");
  const msgTimestamp = headers.get("svix-timestamp");
  const msgSignature = headers.get("svix-signature");
  if (!msgId || !msgTimestamp || !msgSignature) return false;

  // Reject timestamps older than 5 minutes to prevent replay attacks
  const ts = parseInt(msgTimestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  // Strip "whsec_" prefix, base64-decode to get raw key bytes
  const rawSecret = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const keyBytes = Uint8Array.from(atob(rawSecret), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signedContent = `${msgId}.${msgTimestamp}.${body}`;
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent)
  );
  const computed = `v1,${btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))}`;

  // svix-signature may contain multiple space-separated signatures
  return msgSignature.split(" ").some((sig) => sig === computed);
}

// ── Resend webhook endpoint ───────────────────────────────────────────────────
// Handles both:
//   • Inbound email replies (type: "email.inbound" or no type field — raw inbound)
//   • Delivery event notifications (email.delivered, email.bounced, etc.)
//
// Setup required in Resend dashboard:
//   1. Webhooks → Add endpoint → https://scrupulous-goat-308.convex.site/resend-inbound
//   2. Select all "Email" events + enable Inbound if using inbound routing
//   3. Signing secret is stored in RESEND_WEBHOOK_SECRET Convex env var
//
// Inbound email routing also requires:
//   • contact.kazicloud.co.ke MX record pointing to Resend's inbound SMTP
//   • Resend Inbound domain configured for contact.kazicloud.co.ke
http.route({
  path: "/resend-inbound",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    // Read raw body once — needed for signature verification
    const rawBody = await req.text();

    // ── Verify Svix signature ────────────────────────────────────────────────
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET ?? "";
    if (webhookSecret) {
      const valid = await verifySvixSignature(rawBody, req.headers, webhookSecret);
      if (!valid) {
        console.warn("Resend webhook: invalid signature — rejected");
        return new Response(JSON.stringify({ ok: false, reason: "invalid_signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    try {
      const payload = JSON.parse(rawBody);

      // ── Resend wraps every webhook event in { type, data } ────────────────
      // "email.received" = inbound email (user replied from their mail client)
      // Everything else  = delivery event (sent, delivered, bounced, etc.)
      const eventType: string | undefined = payload.type;

      // For inbound emails, Resend sends type="email.received" and puts the
      // email fields inside payload.data (not at the root).
      const isInbound =
        !eventType ||              // raw inbound (no type field) — legacy
        eventType === "email.received" ||
        eventType === "email.inbound";

      if (!isInbound) {
        // Delivery event — log and acknowledge, nothing more needed for now
        console.log(`Resend event: ${eventType}`, payload.data?.email_id ?? "");
        return new Response(JSON.stringify({ ok: true, event: eventType }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // ── Inbound email (user replied from their email client) ─────────────
      // For email.received (inbound), Resend delivers the full email content
      // (text, html, headers) directly inside payload.data — no API fetch needed.
      // NOTE: GET /emails/{id} only works for outbound emails; inbound IDs return 404.
      const email = payload.data ?? payload;

      console.log("Resend inbound payload keys", Object.keys(email as object));

      const rawFrom: string = (email.from as string | undefined) ?? "";
      const emailMatch = rawFrom.match(/<([^>]+)>/) ?? rawFrom.match(/(\S+@\S+)/);
      const fromEmail = (emailMatch?.[1] ?? rawFrom).toLowerCase().trim();
      const nameMatch = rawFrom.match(/^([^<]+)</);
      const fromName = nameMatch
        ? nameMatch[1]!.trim()
        : (fromEmail.split("@")[0] ?? "User");

      // Prefer plain text; fall back to HTML-stripped content
      const plainText: string = ((email.text as string | undefined) ?? "").trim();
      const htmlStripped: string = email.html
        ? (email.html as string)
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>/gi, "\n")
            .replace(/<\/div>/gi, "\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&gt;/g, ">")
            .replace(/&lt;/g, "<")
            .replace(/&amp;/g, "&")
            .replace(/&nbsp;/g, " ")
            .trim()
        : "";
      const rawText = plainText || htmlStripped;

      // Strip quoted reply blocks — lines starting with ">" and Gmail-style headers
      const lines = rawText.split("\n");
      const filteredLines: string[] = [];
      for (const line of lines) {
        const trimmed = line.trimStart();
        if (/^On .+wrote:/s.test(trimmed)) break;
        if (trimmed.startsWith(">")) continue;
        filteredLines.push(line);
      }
      const replyText = filteredLines.join("\n").trim();

      console.log("Resend inbound parsed", { fromEmail, rawTextLen: rawText.length, replyTextLen: replyText.length, replyPreview: replyText.slice(0, 120) });

      if (!fromEmail || !replyText) {
        return new Response(JSON.stringify({ ok: false, reason: "empty" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Extract In-Reply-To for SMTP thread matching
      // Our outgoing Message-IDs are "<localpart@contact.kazicloud.co.ke>"
      // Resend may provide headers as an object or an array of {name,value} pairs
      const rawHeaders: unknown = email.headers ?? {};
      let emailHeaders: Record<string, string> = {};
      if (Array.isArray(rawHeaders)) {
        for (const h of rawHeaders as Array<{ name: string; value: string }>) {
          emailHeaders[h.name.toLowerCase()] = h.value;
        }
      } else {
        emailHeaders = rawHeaders as Record<string, string>;
        // normalise keys to lowercase
        for (const k of Object.keys(emailHeaders)) {
          emailHeaders[k.toLowerCase()] = emailHeaders[k] as string;
        }
      }
      const inReplyToRaw: string = emailHeaders["in-reply-to"] ?? "";
      const inReplyToLocal = inReplyToRaw.replace(/[<>]/g, "").split("@")[0] ?? undefined;

      await ctx.runMutation(api.contactMessages.saveUserInboundReply, {
        email: fromEmail,
        name: fromName,
        replyText,
        inReplyToMessageId: inReplyToLocal || undefined,
      });

      console.log(`Resend inbound: saved reply from ${fromEmail}`);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Resend webhook error:", err);
      return new Response(JSON.stringify({ ok: false }), {
        status: 200, // always 200 so Resend doesn't keep retrying
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
