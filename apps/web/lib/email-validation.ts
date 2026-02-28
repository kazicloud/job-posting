const FREE_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "mail.com",
  "protonmail.com",
  "zoho.com",
  "yandex.com",
];

export function isWorkEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? !FREE_EMAIL_DOMAINS.includes(domain) : false;
}

export function extractDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() || "";
}

export function validateWebsiteDomain(email: string, website: string): boolean {
  const emailDomain = extractDomain(email);
  const websiteDomain = website
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    ?.toLowerCase() || "";
  
  return emailDomain === websiteDomain || emailDomain.endsWith(`.${websiteDomain}`);
}
