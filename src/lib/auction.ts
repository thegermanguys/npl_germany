import { AUCTION_STATUSES, type AuctionStatus } from "./types.ts";

export { AUCTION_STATUSES, type AuctionStatus };

export type PublicAuctionPlayer = {
  id: string;
  full_name: string;
  city: string;
  playing_role: string;
  experience: string;
  base_price: number | null;
  sold_price: number | null;
  photo_id: string | null;
  auction_status: AuctionStatus;
  franchise_name: string | null;
  stats_matches: number | null;
  stats_runs: number | null;
  stats_wickets: number | null;
};

export type PublicAuctionPayload = {
  closed: boolean;
  remaining: number;
  current: PublicAuctionPlayer | null;
  recentSold: Array<{
    id: string;
    full_name: string;
    franchise_name: string | null;
    sold_price: number | null;
  }>;
};

export const DEFAULT_PURSE_TOTAL = 50_000;
export const AUCTION_POLL_MS = 4000;

export function isAuctionStatus(value: string): value is AuctionStatus {
  return (AUCTION_STATUSES as readonly string[]).includes(value);
}

export function auctionStatusLabel(status: AuctionStatus): string {
  if (status === "pending_review") return "Pending review";
  if (status === "in_auction_pool") return "In pool";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  if (status === "sold") return "Sold";
  return "Unsold";
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseEuroAmount(raw: string): number | null {
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const n = Number(trimmed.replace(",", "."));
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

export function purseWouldExceed(purseTotal: number, purseSpent: number, price: number): boolean {
  return purseSpent + price > purseTotal;
}

/** Next in-pool player after the current one. If current is gone, the first remaining. */
export function nextPoolPlayerId(poolIds: string[], currentId: string | null): string | null {
  if (poolIds.length === 0) return null;
  if (!currentId) return poolIds[0];
  const index = poolIds.indexOf(currentId);
  if (index === -1) return poolIds[0];
  if (index + 1 < poolIds.length) return poolIds[index + 1];
  return poolIds[index];
}

export function franchiseCityParam(city: string): string {
  return city.trim().toLowerCase();
}
