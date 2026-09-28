import { auctionStatusLabel, type AuctionStatus } from "@/lib/auction";

export function AuctionStatusBadge({ status }: { status: AuctionStatus }) {
  return <span className={`elig-badge auction-${status}`}>{auctionStatusLabel(status)}</span>;
}
