import { httpAction } from './_generated/server';
import { internal } from './_generated/api';
import { Webhook } from 'svix';

export const handleClerkWebhook = httpAction(async (ctx, request) => {
  const svix_id = request.headers.get('svix-id');
  const svix_timestamp = request.headers.get('svix-timestamp');
  const svix_signature = request.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing headers', { status: 400 });
  }

  const body = await request.text();
  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let event;
  try {
    event = webhook.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
  } catch (err) {
    return new Response('Invalid signature', { status: 401 });
  }

  const { id, email_addresses, first_name, last_name, image_url } = event.data;

  switch (event.type) {
    case 'user.created':
      await ctx.runMutation(internal.users.createFromClerk, {
        clerkId: id,
        email: email_addresses?.[0]?.email_address || '',
        firstName: first_name || '',
        lastName: last_name || '',
        imageUrl: image_url || '',
      });
      break;
  }

  return new Response('OK', { status: 200 });
});

// HTTP action to save additional signup data after Clerk creates the user
export const saveSignupData = httpAction(async (ctx, request) => {
  try {
    const body = await request.json() as {
      clerkId: string;
      roles: string[];
      fields?: string[];
      otherFieldDescription?: string;
      companyInfo?: {
        companyName: string;
        companyType: string;
        companyIndustry: string[];
      };
    };

    if (!body.clerkId) {
      return new Response('Missing clerkId', { status: 400 });
    }

    await ctx.runMutation(internal.users.updateSignupData, {
      clerkId: body.clerkId,
      roles: body.roles,
      fields: body.fields,
      otherFieldDescription: body.otherFieldDescription,
      companyInfo: body.companyInfo,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving signup data:', error);
    return new Response('Internal error', { status: 500 });
  }
});
