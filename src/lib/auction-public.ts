import {
  getAuctionState,
  getProfileById,
  listAuctionPool,
  listRecentSales,
} from "./queries";
import type { PublicAuctionPayload, PublicAuctionPlayer } from "./auction";

function toPublic(player: Awaited<ReturnType<typeof getProfileById>>): PublicAuctionPlayer | null {
  if (!player) return null;
  return {
    id: player.id,
    full_name: player.full_name,
    city: player.city,
    playing_role: player.playing_role,
    experience: player.experience,
    base_price: player.base_price,
    sold_price: player.sold_price,
    photo_id: player.photo_id,
    auction_status: player.auction_status,
    franchise_name: player.franchise_name,
    stats_matches: player.stats_matches,
    stats_runs: player.stats_runs,
    stats_wickets: player.stats_wickets,
  };
}

export async function loadPublicAuction(): Promise<PublicAuctionPayload> {
  const state = await getAuctionState();
  const [pool, current, recent] = await Promise.all([
    listAuctionPool(),
    state.currentPlayerId ? getProfileById(state.currentPlayerId) : Promise.resolve(null),
    listRecentSales(8),
  ]);
  return {
    closed: state.closed,
    remaining: pool.length,
    current: toPublic(current),
    recentSold: recent.map((player) => ({
      id: player.id,
      full_name: player.full_name,
      franchise_name: player.franchise_name,
      sold_price: player.sold_price,
    })),
  };
}
