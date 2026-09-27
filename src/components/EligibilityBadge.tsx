import { eligibilityLabel, isBuyable } from "@/lib/eligibility";
import type { PlayerListItem } from "@/lib/types";

export function EligibilityBadge({ player }: { player: PlayerListItem }) {
  const buyable = isBuyable(player);
  return (
    <span className={`elig-badge elig-${player.eligibility_status}${buyable ? " buyable" : ""}`}>
      {buyable ? "Buyable" : eligibilityLabel(player.eligibility_status)}
    </span>
  );
}
