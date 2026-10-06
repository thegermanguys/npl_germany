import type { EligibilityStatus, PlayerListItem, SessionUser } from "./types";

export function isBuyable(player: Pick<PlayerListItem, "eligibility_status" | "nepali_citizen" | "germany_legal_resident">): boolean {
  return (
    player.eligibility_status === "confirmed" &&
    player.nepali_citizen &&
    player.germany_legal_resident
  );
}

export function eligibilityLabel(status: EligibilityStatus): string {
  if (status === "confirmed") return "Eligible";
  if (status === "rejected") return "Not eligible";
  return "Pending review";
}

export function canViewPlayer(player: PlayerListItem, user: SessionUser | null): boolean {
  if (user?.role === "admin") return true;
  if (user?.userId === player.user_id) return true;
  return isBuyable(player);
}

export function canSeeContact(user: SessionUser | null): boolean {
  return user?.role === "admin" || user?.role === "franchise_owner" || user?.role === "franchise_staff";
}

/** Contact fields never reach the client unless the viewer is league staff or that club's desk. */
export function playersForViewer(players: PlayerListItem[], user: SessionUser | null): PlayerListItem[] {
  if (user?.role === "admin") return players;
  const buyable = players.filter(isBuyable);
  return canSeeContact(user) ? buyable : buyable.map((player) => ({ ...player, phone: null, email: "" }));
}
