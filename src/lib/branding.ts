import { DbNotConfiguredError, isDatabaseConfigured } from "./db";
import { LEAGUE_LOGO_SRC } from "./brand";
import { mediaPath } from "./media";
import { getLeagueLogoId } from "./queries";

export { LEAGUE_LOGO_SRC, SITE_ORIGIN } from "./brand";

export async function leagueLogoUrl(): Promise<string> {
  if (!isDatabaseConfigured()) return LEAGUE_LOGO_SRC;
  try {
    const id = await getLeagueLogoId();
    return id ? mediaPath(id) : LEAGUE_LOGO_SRC;
  } catch (error) {
    if (error instanceof DbNotConfiguredError) return LEAGUE_LOGO_SRC;
    return LEAGUE_LOGO_SRC;
  }
}
