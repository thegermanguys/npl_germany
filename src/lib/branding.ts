import { DbNotConfiguredError, isDatabaseConfigured } from "./db";
import { mediaPath } from "./media";
import { getLeagueLogoId } from "./queries";

export async function leagueLogoUrl(): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const id = await getLeagueLogoId();
    return id ? mediaPath(id) : null;
  } catch (error) {
    if (error instanceof DbNotConfiguredError) return null;
    return null;
  }
}
