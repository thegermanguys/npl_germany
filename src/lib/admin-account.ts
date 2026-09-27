/** League admin login. Password is never stored in git. */
export const LEAGUE_ADMIN_EMAIL = "nplgermany.admin@thegermanguy.org";
export const UNSET_PASSWORD_HASH = "unset";

export function isUsablePasswordHash(hash: string | null | undefined): boolean {
  return Boolean(hash && /^\$2[aby]\$/.test(hash));
}
