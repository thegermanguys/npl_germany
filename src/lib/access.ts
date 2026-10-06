import { LEAGUE_ADMIN_EMAIL } from "./admin-account.ts";
import type { Role } from "./types";

export const MAX_FRANCHISE_STAFF = 2;

export type AccountRef = {
  userId?: string;
  email?: string | null;
  role?: Role | null;
};

export function isLeagueSuperAdmin(user: AccountRef | null | undefined): boolean {
  if (!user || user.role !== "admin") return false;
  return (user.email ?? "").trim().toLowerCase() === LEAGUE_ADMIN_EMAIL;
}

export function isAllowedAdmin(role: Role | null | undefined): boolean {
  return role === "admin";
}

export function isAllowedOwner(role: Role | null | undefined): boolean {
  return role === "franchise_owner";
}

export function canOpenOwnerDesk(role: Role | null | undefined): boolean {
  return role === "franchise_owner" || role === "franchise_staff";
}

export function canManageClubStaff(role: Role | null | undefined): boolean {
  return role === "franchise_owner";
}

/** Auction sales stay with the league. Franchise staff cannot sell players. */
export function canSellPlayers(role: Role | null | undefined): boolean {
  return role === "admin";
}

export function canOpenIdentityDocuments(role: Role | null | undefined): boolean {
  return role === "admin" || role === "franchise_owner" || role === "player";
}

export function staffBlockedFromDocuments(role: Role | null | undefined): boolean {
  return role === "franchise_staff";
}

export function canInviteLeagueAdmin(user: AccountRef | null | undefined): boolean {
  return isLeagueSuperAdmin(user);
}

export function canRemoveLeagueAdmin(
  actor: AccountRef | null | undefined,
  target: AccountRef | null | undefined,
): boolean {
  if (!isLeagueSuperAdmin(actor) || !target) return false;
  if (target.role !== "admin") return false;
  if (isLeagueSuperAdmin(target)) return false;
  return true;
}

/** League admins cannot change the super admin. Nobody can demote that account. */
export function canChangeAccount(
  actor: AccountRef | null | undefined,
  target: AccountRef | null | undefined,
): boolean {
  if (!actor || !target || actor.role !== "admin") return false;
  if (isLeagueSuperAdmin(target) && !isLeagueSuperAdmin(actor)) return false;
  return true;
}

export function staffSlotOpen(currentStaff: number): boolean {
  return currentStaff < MAX_FRANCHISE_STAFF;
}

export function forbiddenForClub(input: {
  role: Role | null | undefined;
  ownFranchiseId: string | null;
  requestedFranchiseId: string;
}): boolean {
  if (!canOpenOwnerDesk(input.role)) return true;
  if (!input.ownFranchiseId) return true;
  return input.ownFranchiseId !== input.requestedFranchiseId;
}

/** True when this path must 403 for the given role. */
export function forbiddenForPath(path: string, role: Role | null | undefined): boolean {
  if (path === "/admin" || path.startsWith("/admin/")) return !isAllowedAdmin(role);
  if (path === "/owner" || path.startsWith("/owner/")) return !canOpenOwnerDesk(role);
  return false;
}

export function homeForRole(role: Role | null | undefined): string | null {
  if (role === "admin") return "/admin";
  if (role === "franchise_owner" || role === "franchise_staff") return "/owner";
  if (role === "player") return "/account";
  return null;
}

export function roleLabel(user: { role: Role; email?: string | null }): string {
  if (isLeagueSuperAdmin(user)) return "League super admin";
  if (user.role === "admin") return "League admin";
  if (user.role === "franchise_owner") return "Franchise owner";
  if (user.role === "franchise_staff") return "Franchise staff";
  return "Player";
}
