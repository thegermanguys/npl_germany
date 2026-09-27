import { cookies } from "next/headers";
import type { SessionUser } from "./types";
import { createSessionToken, isAuthConfigured, readSessionToken, SESSION_COOKIE } from "./token";

export { isAuthConfigured, SESSION_COOKIE } from "./token";

export async function getSession(): Promise<SessionUser | null> {
  if (!isAuthConfigured()) return null;
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

export async function setSession(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export function canInspectPlayers(user: SessionUser | null): boolean {
  return user?.role === "franchise_owner" || user?.role === "admin";
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === "admin";
}
