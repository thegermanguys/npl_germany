import { createHash, randomBytes } from "node:crypto";

export const RESET_NOTICE =
  "If that email is on the league, a reset link was sent.";
export const INVITE_NOTICE = "Player invited.";
export const RESET_TTL_MS = 60 * 60 * 1000;
export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function isMailerConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESET_FROM_EMAIL?.trim());
}

export function newResetToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function resetExpiresAt(now = Date.now()): Date {
  return new Date(now + RESET_TTL_MS);
}

export function inviteExpiresAt(now = Date.now()): Date {
  return new Date(now + INVITE_TTL_MS);
}

export function resetUrl(origin: string, token: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/login/reset?token=${encodeURIComponent(token)}`;
}

export function siteOrigin(
  headerList: { get(name: string): string | null },
  siteUrl = process.env.SITE_URL,
): string {
  const configured = siteUrl?.trim().replace(/\/$/, "") ?? "";
  if (configured) return configured;
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "";
  if (!host) return "";
  const proto = headerList.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function inviteEmailText(link: string): string {
  return `Set your password here (expires in seven days):\n${link}\n`;
}

export async function sendResetEmail(
  to: string,
  link: string,
  mail?: { subject: string; text: string },
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESET_FROM_EMAIL?.trim();
  if (!key || !from) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: mail?.subject ?? "NPL Germany password",
        text: mail?.text ?? `Reset your password here (expires in one hour):\n${link}\n`,
      }),
    });
    if (!response.ok) {
      console.error("reset email failed", response.status);
      return false;
    }
    return true;
  } catch {
    console.error("reset email failed");
    return false;
  }
}
