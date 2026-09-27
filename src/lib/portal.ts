import { DbNotConfiguredError, isDatabaseConfigured } from "./db";
import { getCurrentSeason, listFranchises, listPlayers } from "./queries";
import { getSession } from "./session";
import type { FranchiseRow, PlayerListItem, SeasonRow, SessionUser } from "./types";

export type PortalContext = {
  user: SessionUser | null;
  configured: boolean;
  season: SeasonRow | null;
  franchises: FranchiseRow[];
  players: PlayerListItem[];
};

export async function loadPortal(): Promise<PortalContext> {
  const user = await getSession();
  if (!isDatabaseConfigured()) {
    return { user, configured: false, season: null, franchises: [], players: [] };
  }
  try {
    const season = await getCurrentSeason();
    const [franchises, players] = await Promise.all([
      listFranchises(),
      season ? listPlayers(season.id) : Promise.resolve([]),
    ]);
    return { user, configured: true, season, franchises, players };
  } catch (error) {
    if (error instanceof DbNotConfiguredError) {
      return { user, configured: false, season: null, franchises: [], players: [] };
    }
    throw error;
  }
}
