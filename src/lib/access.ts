import type { Role } from "./types";

export function isAllowedAdmin(role: Role | null | undefined): boolean {
  return role === "admin";
}

export function isAllowedOwner(role: Role | null | undefined): boolean {
  return role === "franchise_owner";
}

/** True when this path must 403 for the given role. */
export function forbiddenForPath(path: string, role: Role | null | undefined): boolean {
  if (path === "/admin" || path.startsWith("/admin/")) return !isAllowedAdmin(role);
  if (path === "/owner" || path.startsWith("/owner/")) return !isAllowedOwner(role);
  return false;
}
