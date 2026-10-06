import { SignJWT, jwtVerify } from "jose";
import { ROLES, type Role, type SessionUser } from "./types";

export const SESSION_COOKIE = "npl_session";

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET?.trim());
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    userId: user.userId,
    email: user.email,
    role: user.role,
    displayName: user.displayName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
}

export async function readSessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.displayName !== "string"
    ) {
      return null;
    }
    if (!(ROLES as readonly string[]).includes(payload.role)) return null;
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role as Role,
      displayName: payload.displayName,
    };
  } catch {
    return null;
  }
}
