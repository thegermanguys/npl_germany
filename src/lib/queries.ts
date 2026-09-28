import { DEFAULT_PURSE_TOTAL, purseWouldExceed } from "./auction";
import { applyKnownCardToPlayer, type PlayerStats } from "./cricheroes";
import { getSql } from "./db";
import { asMediaBuffer, bytesForDatabase, isDocumentSlot, type DocumentSlot, type MediaKind } from "./media";
import type {
  AuctionStatus,
  EligibilityStatus,
  FixtureRow,
  FixtureStatus,
  FranchiseRow,
  PlayerListItem,
  PlayerProfileRow,
  Role,
  SeasonRow,
  SeasonStatus,
  StatsSource,
  UserRow,
} from "./types";

function asIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function asBool(value: unknown): boolean {
  return value === true || value === "t" || value === "true";
}

function mapPlayer(row: Record<string, unknown>): PlayerListItem {
  return applyKnownCardToPlayer({
    id: String(row.id),
    user_id: String(row.user_id),
    season_id: String(row.season_id),
    full_name: String(row.full_name),
    phone: (row.phone as string | null) ?? null,
    city: String(row.city),
    playing_role: row.playing_role as PlayerListItem["playing_role"],
    experience: String(row.experience),
    batting_hand: (row.batting_hand as string | null) ?? null,
    bowling_style: (row.bowling_style as string | null) ?? null,
    franchise_id: (row.franchise_id as string | null) ?? null,
    nepali_citizen: asBool(row.nepali_citizen),
    germany_legal_resident: asBool(row.germany_legal_resident),
    eligibility_status: (row.eligibility_status as EligibilityStatus) ?? "pending",
    eligibility_reviewed_at: (row.eligibility_reviewed_at as string | null) ?? null,
    cricheroes_url: (row.cricheroes_url as string | null) ?? null,
    stats_source: (row.stats_source as StatsSource) ?? "none",
    stats_matches: asNumber(row.stats_matches),
    stats_runs: asNumber(row.stats_runs),
    stats_wickets: asNumber(row.stats_wickets),
    stats_batting_avg: asNumber(row.stats_batting_avg),
    stats_strike_rate: asNumber(row.stats_strike_rate),
    stats_economy: asNumber(row.stats_economy),
    stats_high_score: asNumber(row.stats_high_score),
    stats_best_bowling: (row.stats_best_bowling as string | null) ?? null,
    stats_fetched_at: (row.stats_fetched_at as string | null) ?? null,
    photo_id: (row.photo_id as string | null) ?? null,
    auction_status: (row.auction_status as AuctionStatus) ?? "pending_review",
    base_price: asNumber(row.base_price),
    sold_to_franchise_id: (row.sold_to_franchise_id as string | null) ?? null,
    sold_price: asNumber(row.sold_price),
    auction_order: asNumber(row.auction_order),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
    email: String(row.email ?? ""),
    franchise_name: (row.franchise_name as string | null) ?? null,
    franchise_color: (row.franchise_color as string | null) ?? null,
  });
}

export async function getCurrentSeason(): Promise<SeasonRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, year, ball_type, status, is_current
    FROM seasons
    WHERE is_current
    LIMIT 1
  `;
  return (rows[0] as SeasonRow | undefined) ?? null;
}

export async function listSeasons(): Promise<SeasonRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, year, ball_type, status, is_current
    FROM seasons
    ORDER BY year DESC, name
  `;
  return rows as SeasonRow[];
}

export async function updateSeason(
  id: string,
  input: { name: string; year: number; status: SeasonStatus },
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE seasons
    SET name = ${input.name},
        year = ${input.year},
        status = ${input.status},
        updated_at = now()
    WHERE id = ${id}
  `;
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, email, password_hash, role, display_name, created_at::text
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;
  return (rows[0] as UserRow | undefined) ?? null;
}

export async function getUserById(id: string): Promise<UserRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, email, password_hash, role, display_name, created_at::text
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `;
  return (rows[0] as UserRow | undefined) ?? null;
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  role: Role;
  displayName: string;
}): Promise<UserRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO users (email, password_hash, role, display_name)
    VALUES (${input.email}, ${input.passwordHash}, ${input.role}, ${input.displayName})
    RETURNING id, email, password_hash, role, display_name, created_at::text
  `;
  return rows[0] as UserRow;
}

export async function listUsers(): Promise<Array<UserRow & { franchise_name: string | null }>> {
  const sql = getSql();
  const rows = await sql`
    SELECT u.id, u.email, u.password_hash, u.role, u.display_name, u.created_at::text,
           COALESCE(owned.full_name, member.full_name) AS franchise_name
    FROM users u
    LEFT JOIN franchises owned ON owned.owner_user_id = u.id
    LEFT JOIN franchise_memberships fm ON fm.user_id = u.id
    LEFT JOIN franchises member ON member.id = fm.franchise_id
    ORDER BY u.role, u.display_name
  `;
  return rows as Array<UserRow & { franchise_name: string | null }>;
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET password_hash = ${passwordHash}, updated_at = now()
    WHERE id = ${userId}
  `;
}

export async function replacePasswordResetToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE password_reset_tokens
    SET used_at = now()
    WHERE user_id = ${input.userId} AND used_at IS NULL
  `;
  await sql`
    INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
    VALUES (${input.userId}, ${input.tokenHash}, ${input.expiresAt.toISOString()})
  `;
}

export async function findValidResetToken(
  tokenHash: string,
): Promise<{ id: string; userId: string } | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, user_id
    FROM password_reset_tokens
    WHERE token_hash = ${tokenHash}
      AND used_at IS NULL
      AND expires_at > now()
    LIMIT 1
  `;
  const row = rows[0] as { id: string; user_id: string } | undefined;
  if (!row) return null;
  return { id: String(row.id), userId: String(row.user_id) };
}

export async function consumeResetToken(id: string): Promise<void> {
  const sql = getSql();
  await sql`UPDATE password_reset_tokens SET used_at = now() WHERE id = ${id}`;
}

export async function invalidateUserResetTokens(userId: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE password_reset_tokens
    SET used_at = now()
    WHERE user_id = ${userId} AND used_at IS NULL
  `;
}

function mapFranchise(row: Record<string, unknown>): FranchiseRow {
  return {
    id: String(row.id),
    slug: String(row.slug),
    city: String(row.city),
    name: String(row.name),
    full_name: String(row.full_name),
    tagline: String(row.tagline ?? ""),
    description: String(row.description ?? ""),
    color_key: String(row.color_key),
    sort_order: Number(row.sort_order ?? 0),
    logo_id: row.logo_id ? String(row.logo_id) : null,
    owner_user_id: row.owner_user_id ? String(row.owner_user_id) : null,
    purse_total: asNumber(row.purse_total) ?? DEFAULT_PURSE_TOTAL,
    purse_spent: asNumber(row.purse_spent) ?? 0,
    created_at: String(row.created_at ?? ""),
    owner_name: row.owner_name ? String(row.owner_name) : null,
  };
}

export async function listFranchises(): Promise<FranchiseRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, slug, city, name, full_name, tagline, description, color_key, sort_order,
           logo_id, owner_user_id, purse_total, purse_spent, created_at::text
    FROM franchises
    ORDER BY sort_order, city
  `;
  return rows.map((row) => mapFranchise(row as Record<string, unknown>));
}

export async function getFranchise(id: string): Promise<FranchiseRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, slug, city, name, full_name, tagline, description, color_key, sort_order,
           logo_id, owner_user_id, purse_total, purse_spent, created_at::text
    FROM franchises
    WHERE id = ${id}
    LIMIT 1
  `;
  return rows[0] ? mapFranchise(rows[0] as Record<string, unknown>) : null;
}

export async function updateFranchise(
  id: string,
  input: { tagline: string; description: string; purseTotal: number },
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE franchises
    SET tagline = ${input.tagline},
        description = ${input.description},
        purse_total = ${input.purseTotal}
    WHERE id = ${id}
  `;
}

export async function assignFranchiseOwner(userId: string, franchiseId: string): Promise<void> {
  const sql = getSql();
  await sql`UPDATE franchises SET owner_user_id = NULL WHERE owner_user_id = ${userId}`;
  await sql`UPDATE franchises SET owner_user_id = ${userId} WHERE id = ${franchiseId}`;
  await sql`
    DELETE FROM franchise_memberships
    WHERE user_id = ${userId} OR franchise_id = ${franchiseId}
  `;
  await sql`
    INSERT INTO franchise_memberships (user_id, franchise_id)
    VALUES (${userId}, ${franchiseId})
    ON CONFLICT (user_id, franchise_id) DO NOTHING
  `;
}

export async function ownerFranchiseIds(userId: string): Promise<string[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT franchise_id FROM franchise_memberships WHERE user_id = ${userId}
  `;
  return rows.map((row) => String((row as { franchise_id: string }).franchise_id));
}

export async function createPlayerProfile(input: {
  userId: string;
  seasonId: string;
  fullName: string;
  phone: string;
  city: string;
  playingRole: string;
  experience: string;
  nepaliCitizen?: boolean;
  germanyLegalResident?: boolean;
  cricheroesUrl?: string | null;
  stats?: PlayerStats | null;
  statsSource?: StatsSource;
}): Promise<PlayerProfileRow> {
  const sql = getSql();
  const stats = input.stats;
  const rows = await sql`
    INSERT INTO player_profiles (
      user_id, season_id, full_name, phone, city, playing_role, experience,
      nepali_citizen, germany_legal_resident, cricheroes_url, stats_source,
      stats_matches, stats_runs, stats_wickets, stats_batting_avg, stats_strike_rate,
      stats_economy, stats_high_score, stats_best_bowling, stats_fetched_at
    )
    VALUES (
      ${input.userId}, ${input.seasonId}, ${input.fullName}, ${input.phone},
      ${input.city}, ${input.playingRole}, ${input.experience},
      ${input.nepaliCitizen ?? false}, ${input.germanyLegalResident ?? false},
      ${input.cricheroesUrl ?? null}, ${input.statsSource ?? "none"},
      ${stats?.matches ?? null}, ${stats?.runs ?? null}, ${stats?.wickets ?? null},
      ${stats?.battingAvg ?? null}, ${stats?.strikeRate ?? null}, ${stats?.economy ?? null},
      ${stats?.highScore ?? null}, ${stats?.bestBowling ?? null},
      ${stats ? new Date().toISOString() : null}
    )
    RETURNING id, user_id, season_id, full_name, phone, city, playing_role, experience,
              batting_hand, bowling_style, franchise_id, created_at::text, updated_at::text
  `;
  return rows[0] as PlayerProfileRow;
}

export async function getProfileByUserId(userId: string): Promise<PlayerListItem | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT p.id, p.user_id, p.season_id, p.full_name, p.phone, p.city, p.playing_role,
           p.experience, p.batting_hand, p.bowling_style, p.franchise_id,
           p.nepali_citizen, p.germany_legal_resident, p.eligibility_status,
           p.eligibility_reviewed_at::text, p.cricheroes_url, p.stats_source,
           p.stats_matches, p.stats_runs, p.stats_wickets, p.stats_batting_avg,
           p.stats_strike_rate, p.stats_economy, p.stats_high_score, p.stats_best_bowling,
           p.stats_fetched_at::text, p.photo_id, p.created_at::text, p.updated_at::text,
           p.auction_status, p.base_price, p.sold_to_franchise_id, p.sold_price, p.auction_order,
           u.email, f.full_name AS franchise_name, f.color_key AS franchise_color
    FROM player_profiles p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN franchises f ON f.id = COALESCE(p.sold_to_franchise_id, p.franchise_id)
    WHERE p.user_id = ${userId}
    LIMIT 1
  `;
  return rows[0] ? mapPlayer(rows[0] as Record<string, unknown>) : null;
}

export async function getProfileById(id: string): Promise<PlayerListItem | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT p.id, p.user_id, p.season_id, p.full_name, p.phone, p.city, p.playing_role,
           p.experience, p.batting_hand, p.bowling_style, p.franchise_id,
           p.nepali_citizen, p.germany_legal_resident, p.eligibility_status,
           p.eligibility_reviewed_at::text, p.cricheroes_url, p.stats_source,
           p.stats_matches, p.stats_runs, p.stats_wickets, p.stats_batting_avg,
           p.stats_strike_rate, p.stats_economy, p.stats_high_score, p.stats_best_bowling,
           p.stats_fetched_at::text, p.photo_id, p.created_at::text, p.updated_at::text,
           p.auction_status, p.base_price, p.sold_to_franchise_id, p.sold_price, p.auction_order,
           u.email, f.full_name AS franchise_name, f.color_key AS franchise_color
    FROM player_profiles p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN franchises f ON f.id = COALESCE(p.sold_to_franchise_id, p.franchise_id)
    WHERE p.id = ${id}
    LIMIT 1
  `;
  return rows[0] ? mapPlayer(rows[0] as Record<string, unknown>) : null;
}

export async function listPlayers(seasonId: string): Promise<PlayerListItem[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT p.id, p.user_id, p.season_id, p.full_name, p.phone, p.city, p.playing_role,
           p.experience, p.batting_hand, p.bowling_style, p.franchise_id,
           p.nepali_citizen, p.germany_legal_resident, p.eligibility_status,
           p.eligibility_reviewed_at::text, p.cricheroes_url, p.stats_source,
           p.stats_matches, p.stats_runs, p.stats_wickets, p.stats_batting_avg,
           p.stats_strike_rate, p.stats_economy, p.stats_high_score, p.stats_best_bowling,
           p.stats_fetched_at::text, p.photo_id, p.created_at::text, p.updated_at::text,
           p.auction_status, p.base_price, p.sold_to_franchise_id, p.sold_price, p.auction_order,
           u.email, f.full_name AS franchise_name, f.color_key AS franchise_color
    FROM player_profiles p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN franchises f ON f.id = COALESCE(p.sold_to_franchise_id, p.franchise_id)
    WHERE p.season_id = ${seasonId}
    ORDER BY p.full_name
  `;
  return rows.map((row) => mapPlayer(row as Record<string, unknown>));
}

export type PlayerUpdateInput = {
  fullName: string;
  phone: string;
  city: string;
  playingRole: string;
  experience: string;
  battingHand: string | null;
  bowlingStyle: string | null;
  franchiseId: string | null;
  nepaliCitizen: boolean;
  germanyLegalResident: boolean;
  cricheroesUrl: string | null;
  stats: PlayerStats | null;
  statsSource: StatsSource;
};

export async function updatePlayerProfile(id: string, input: PlayerUpdateInput): Promise<void> {
  const sql = getSql();
  const stats = input.stats;
  await sql`
    UPDATE player_profiles
    SET full_name = ${input.fullName},
        phone = ${input.phone},
        city = ${input.city},
        playing_role = ${input.playingRole},
        experience = ${input.experience},
        batting_hand = ${input.battingHand},
        bowling_style = ${input.bowlingStyle},
        franchise_id = ${input.franchiseId},
        nepali_citizen = ${input.nepaliCitizen},
        germany_legal_resident = ${input.germanyLegalResident},
        cricheroes_url = ${input.cricheroesUrl},
        stats_source = ${input.statsSource},
        stats_matches = ${stats?.matches ?? null},
        stats_runs = ${stats?.runs ?? null},
        stats_wickets = ${stats?.wickets ?? null},
        stats_batting_avg = ${stats?.battingAvg ?? null},
        stats_strike_rate = ${stats?.strikeRate ?? null},
        stats_economy = ${stats?.economy ?? null},
        stats_high_score = ${stats?.highScore ?? null},
        stats_best_bowling = ${stats?.bestBowling ?? null},
        stats_fetched_at = ${stats ? new Date().toISOString() : null},
        updated_at = now()
    WHERE id = ${id}
  `;
}

export async function setEligibility(id: string, status: EligibilityStatus): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE player_profiles
    SET eligibility_status = ${status},
        eligibility_reviewed_at = now(),
        nepali_citizen = CASE WHEN ${status} = 'confirmed' THEN true ELSE nepali_citizen END,
        germany_legal_resident = CASE WHEN ${status} = 'confirmed' THEN true ELSE germany_legal_resident END,
        updated_at = now()
    WHERE id = ${id}
  `;
}

export async function countPendingEligibility(): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT count(*)::int AS n FROM player_profiles WHERE eligibility_status = 'pending'
  `;
  return Number((rows[0] as { n: number } | undefined)?.n ?? 0);
}

export async function countUsersByRole(): Promise<Record<Role, number>> {
  const sql = getSql();
  const rows = await sql`
    SELECT role, count(*)::int AS n FROM users GROUP BY role
  `;
  const counts: Record<Role, number> = { player: 0, franchise_owner: 0, admin: 0 };
  for (const row of rows as Array<{ role: Role; n: number }>) {
    counts[row.role] = row.n;
  }
  return counts;
}

export async function insertMediaAsset(input: {
  kind: MediaKind;
  mimeType: string;
  bytes: Buffer;
}): Promise<string> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO media_assets (kind, mime_type, bytes)
    VALUES (${input.kind}, ${input.mimeType}, ${bytesForDatabase(input.bytes)})
    RETURNING id
  `;
  return String((rows[0] as { id: string }).id);
}

export async function getMediaAsset(
  id: string,
): Promise<{ kind: string; mime_type: string; bytes: Buffer } | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT kind, mime_type, bytes FROM media_assets WHERE id = ${id} LIMIT 1
  `;
  const row = rows[0] as { kind: string; mime_type: string; bytes: unknown } | undefined;
  if (!row) return null;
  try {
    return { kind: String(row.kind), mime_type: String(row.mime_type), bytes: asMediaBuffer(row.bytes) };
  } catch {
    return null;
  }
}

export type PlayerDocuments = {
  passport_id: string | null;
  residence_permit_id: string | null;
  health_insurance_id: string | null;
};

export async function getPlayerDocuments(profileId: string): Promise<PlayerDocuments | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT passport_id, residence_permit_id, health_insurance_id
    FROM player_profiles
    WHERE id = ${profileId}
    LIMIT 1
  `;
  const row = rows[0] as PlayerDocuments | undefined;
  if (!row) return null;
  return {
    passport_id: row.passport_id ? String(row.passport_id) : null,
    residence_permit_id: row.residence_permit_id ? String(row.residence_permit_id) : null,
    health_insurance_id: row.health_insurance_id ? String(row.health_insurance_id) : null,
  };
}

export async function findDocumentOwner(
  mediaId: string,
): Promise<{ profileId: string; userId: string } | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, user_id
    FROM player_profiles
    WHERE passport_id = ${mediaId}
       OR residence_permit_id = ${mediaId}
       OR health_insurance_id = ${mediaId}
    LIMIT 1
  `;
  const row = rows[0] as { id: string; user_id: string } | undefined;
  if (!row) return null;
  return { profileId: String(row.id), userId: String(row.user_id) };
}

export async function setPlayerDocument(
  profileId: string,
  slot: DocumentSlot,
  mediaId: string,
): Promise<void> {
  if (!isDocumentSlot(slot)) throw new Error("invalid document slot");
  const sql = getSql();
  const current = await getPlayerDocuments(profileId);
  if (!current) throw new Error("player not found");
  const previous =
    slot === "passport"
      ? current.passport_id
      : slot === "residence_permit"
        ? current.residence_permit_id
        : current.health_insurance_id;
  if (slot === "passport") {
    await sql`UPDATE player_profiles SET passport_id = ${mediaId}, updated_at = now() WHERE id = ${profileId}`;
  } else if (slot === "residence_permit") {
    await sql`UPDATE player_profiles SET residence_permit_id = ${mediaId}, updated_at = now() WHERE id = ${profileId}`;
  } else {
    await sql`UPDATE player_profiles SET health_insurance_id = ${mediaId}, updated_at = now() WHERE id = ${profileId}`;
  }
  if (previous && previous !== mediaId) await deleteMedia(previous);
}

async function deleteMedia(id: string | null): Promise<void> {
  if (!id) return;
  const sql = getSql();
  await sql`DELETE FROM media_assets WHERE id = ${id}`;
}

export async function setPlayerPhoto(profileId: string, mediaId: string): Promise<void> {
  const sql = getSql();
  const rows = await sql`SELECT photo_id FROM player_profiles WHERE id = ${profileId} LIMIT 1`;
  const previous = (rows[0] as { photo_id: string | null } | undefined)?.photo_id ?? null;
  await sql`
    UPDATE player_profiles SET photo_id = ${mediaId}, updated_at = now() WHERE id = ${profileId}
  `;
  if (previous && previous !== mediaId) await deleteMedia(previous);
}

export async function setFranchiseLogo(franchiseId: string, mediaId: string): Promise<void> {
  const sql = getSql();
  const rows = await sql`SELECT logo_id FROM franchises WHERE id = ${franchiseId} LIMIT 1`;
  const previous = (rows[0] as { logo_id: string | null } | undefined)?.logo_id ?? null;
  await sql`UPDATE franchises SET logo_id = ${mediaId} WHERE id = ${franchiseId}`;
  if (previous && previous !== mediaId) await deleteMedia(previous);
}

export async function getFranchiseByCity(city: string): Promise<FranchiseRow | null> {
  const sql = getSql();
  const key = city.trim().toLowerCase();
  const rows = await sql`
    SELECT f.id, f.slug, f.city, f.name, f.full_name, f.tagline, f.description, f.color_key,
           f.sort_order, f.logo_id, f.owner_user_id, f.purse_total, f.purse_spent,
           f.created_at::text, u.display_name AS owner_name
    FROM franchises f
    LEFT JOIN users u ON u.id = f.owner_user_id
    WHERE lower(f.city) = ${key}
    LIMIT 1
  `;
  return rows[0] ? mapFranchise(rows[0] as Record<string, unknown>) : null;
}

export async function listSquad(franchiseId: string): Promise<PlayerListItem[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT p.id, p.user_id, p.season_id, p.full_name, p.phone, p.city, p.playing_role,
           p.experience, p.batting_hand, p.bowling_style, p.franchise_id,
           p.nepali_citizen, p.germany_legal_resident, p.eligibility_status,
           p.eligibility_reviewed_at::text, p.cricheroes_url, p.stats_source,
           p.stats_matches, p.stats_runs, p.stats_wickets, p.stats_batting_avg,
           p.stats_strike_rate, p.stats_economy, p.stats_high_score, p.stats_best_bowling,
           p.stats_fetched_at::text, p.photo_id, p.created_at::text, p.updated_at::text,
           p.auction_status, p.base_price, p.sold_to_franchise_id, p.sold_price, p.auction_order,
           u.email, f.full_name AS franchise_name, f.color_key AS franchise_color
    FROM player_profiles p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN franchises f ON f.id = COALESCE(p.sold_to_franchise_id, p.franchise_id)
    WHERE p.sold_to_franchise_id = ${franchiseId} AND p.auction_status = 'sold'
    ORDER BY p.playing_role, p.full_name
  `;
  return rows.map((row) => mapPlayer(row as Record<string, unknown>));
}

export async function listAuctionPool(): Promise<PlayerListItem[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT p.id, p.user_id, p.season_id, p.full_name, p.phone, p.city, p.playing_role,
           p.experience, p.batting_hand, p.bowling_style, p.franchise_id,
           p.nepali_citizen, p.germany_legal_resident, p.eligibility_status,
           p.eligibility_reviewed_at::text, p.cricheroes_url, p.stats_source,
           p.stats_matches, p.stats_runs, p.stats_wickets, p.stats_batting_avg,
           p.stats_strike_rate, p.stats_economy, p.stats_high_score, p.stats_best_bowling,
           p.stats_fetched_at::text, p.photo_id, p.created_at::text, p.updated_at::text,
           p.auction_status, p.base_price, p.sold_to_franchise_id, p.sold_price, p.auction_order,
           u.email, f.full_name AS franchise_name, f.color_key AS franchise_color
    FROM player_profiles p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN franchises f ON f.id = COALESCE(p.sold_to_franchise_id, p.franchise_id)
    WHERE p.auction_status = 'in_auction_pool'
    ORDER BY p.auction_order NULLS LAST, p.created_at, p.id
  `;
  return rows.map((row) => mapPlayer(row as Record<string, unknown>));
}

export async function listRecentSales(limit = 8): Promise<PlayerListItem[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT p.id, p.user_id, p.season_id, p.full_name, p.phone, p.city, p.playing_role,
           p.experience, p.batting_hand, p.bowling_style, p.franchise_id,
           p.nepali_citizen, p.germany_legal_resident, p.eligibility_status,
           p.eligibility_reviewed_at::text, p.cricheroes_url, p.stats_source,
           p.stats_matches, p.stats_runs, p.stats_wickets, p.stats_batting_avg,
           p.stats_strike_rate, p.stats_economy, p.stats_high_score, p.stats_best_bowling,
           p.stats_fetched_at::text, p.photo_id, p.created_at::text, p.updated_at::text,
           p.auction_status, p.base_price, p.sold_to_franchise_id, p.sold_price, p.auction_order,
           u.email, f.full_name AS franchise_name, f.color_key AS franchise_color
    FROM player_profiles p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN franchises f ON f.id = COALESCE(p.sold_to_franchise_id, p.franchise_id)
    WHERE p.auction_status = 'sold'
    ORDER BY p.updated_at DESC
    LIMIT ${limit}
  `;
  return rows.map((row) => mapPlayer(row as Record<string, unknown>));
}

export type AuctionState = {
  currentPlayerId: string | null;
  closed: boolean;
};

export async function getAuctionState(): Promise<AuctionState> {
  const sql = getSql();
  const rows = await sql`
    SELECT auction_player_id, auction_closed
    FROM league_settings
    WHERE id = 'npl_germany'
    LIMIT 1
  `;
  const row = rows[0] as { auction_player_id: string | null; auction_closed: unknown } | undefined;
  return {
    currentPlayerId: row?.auction_player_id ? String(row.auction_player_id) : null,
    closed: row?.auction_closed === true || row?.auction_closed === "t" || row?.auction_closed === "true",
  };
}

export async function setAuctionPlayer(playerId: string | null): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO league_settings (id, auction_player_id)
    VALUES ('npl_germany', ${playerId})
    ON CONFLICT (id) DO UPDATE SET auction_player_id = EXCLUDED.auction_player_id
  `;
}

export async function setAuctionClosed(closed: boolean): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO league_settings (id, auction_closed)
    VALUES ('npl_germany', ${closed})
    ON CONFLICT (id) DO UPDATE SET auction_closed = EXCLUDED.auction_closed
  `;
}

export async function approvePlayers(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;
  const sql = getSql();
  let n = 0;
  for (const id of ids) {
    const rows = await sql`
      UPDATE player_profiles
      SET auction_status = 'approved', updated_at = now()
      WHERE id = ${id} AND auction_status = 'pending_review'
      RETURNING id
    `;
    n += rows.length;
  }
  return n;
}

export async function setBasePrice(id: string, price: number): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE player_profiles
    SET base_price = ${price}, updated_at = now()
    WHERE id = ${id}
  `;
}

export async function moveToAuctionPool(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const sql = getSql();
  const rows = await sql`
    SELECT auction_status, base_price FROM player_profiles WHERE id = ${id} LIMIT 1
  `;
  const row = rows[0] as { auction_status: string; base_price: number | null } | undefined;
  if (!row) return { ok: false, error: "Player not found." };
  if (row.auction_status !== "approved" && row.auction_status !== "in_auction_pool") {
    return { ok: false, error: "Approve the player before adding them to the pool." };
  }
  const price = asNumber(row.base_price);
  if (price === null || price < 0) return { ok: false, error: "Set a base price first." };
  const maxRows = await sql`
    SELECT COALESCE(MAX(auction_order), 0)::int AS n FROM player_profiles
  `;
  const nextOrder = Number((maxRows[0] as { n: number } | undefined)?.n ?? 0) + 1;
  await sql`
    UPDATE player_profiles
    SET auction_status = 'in_auction_pool',
        auction_order = COALESCE(auction_order, ${nextOrder}),
        updated_at = now()
    WHERE id = ${id}
  `;
  return { ok: true };
}

export async function sellCurrentPlayer(input: {
  playerId: string;
  franchiseId: string;
  price: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const sql = getSql();
  const state = await getAuctionState();
  if (state.closed) return { ok: false, error: "The auction is closed." };
  if (state.currentPlayerId !== input.playerId) {
    return { ok: false, error: "This is not the player on the block." };
  }
  const player = await getProfileById(input.playerId);
  if (!player || player.auction_status !== "in_auction_pool") {
    return { ok: false, error: "That player is not in the pool." };
  }
  const franchise = await getFranchise(input.franchiseId);
  if (!franchise) return { ok: false, error: "Choose a franchise." };
  if (purseWouldExceed(franchise.purse_total, franchise.purse_spent, input.price)) {
    return {
      ok: false,
      error: `This sale would take ${franchise.full_name} over the purse cap.`,
    };
  }
  await sql`
    UPDATE player_profiles
    SET auction_status = 'sold',
        sold_to_franchise_id = ${input.franchiseId},
        sold_price = ${input.price},
        franchise_id = ${input.franchiseId},
        updated_at = now()
    WHERE id = ${input.playerId}
  `;
  await sql`
    UPDATE franchises
    SET purse_spent = purse_spent + ${input.price}
    WHERE id = ${input.franchiseId}
  `;
  return { ok: true };
}

export async function markCurrentUnsold(playerId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const sql = getSql();
  const state = await getAuctionState();
  if (state.closed) return { ok: false, error: "The auction is closed." };
  if (state.currentPlayerId !== playerId) {
    return { ok: false, error: "This is not the player on the block." };
  }
  const rows = await sql`
    UPDATE player_profiles
    SET auction_status = 'unsold', updated_at = now()
    WHERE id = ${playerId} AND auction_status = 'in_auction_pool'
    RETURNING id
  `;
  if (!rows[0]) return { ok: false, error: "That player is not in the pool." };
  return { ok: true };
}

export async function closeAuctionPool(): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    UPDATE player_profiles
    SET auction_status = 'unsold', updated_at = now()
    WHERE auction_status = 'in_auction_pool'
    RETURNING id
  `;
  await setAuctionClosed(true);
  await setAuctionPlayer(null);
  return rows.length;
}

export async function countAuctionByStatus(): Promise<Record<AuctionStatus, number>> {
  const sql = getSql();
  const rows = await sql`
    SELECT auction_status AS status, count(*)::int AS n FROM player_profiles GROUP BY auction_status
  `;
  const counts: Record<AuctionStatus, number> = {
    pending_review: 0,
    approved: 0,
    rejected: 0,
    in_auction_pool: 0,
    sold: 0,
    unsold: 0,
  };
  for (const row of rows as Array<{ status: AuctionStatus; n: number }>) {
    if (row.status in counts) counts[row.status] = row.n;
  }
  return counts;
}

export async function ensureCurrentAuctionPlayer(): Promise<string | null> {
  const state = await getAuctionState();
  if (state.closed) return state.currentPlayerId;
  if (state.currentPlayerId) {
    const current = await getProfileById(state.currentPlayerId);
    if (current) return current.id;
  }
  const pool = await listAuctionPool();
  const first = pool[0]?.id ?? null;
  await setAuctionPlayer(first);
  return first;
}

export async function getLeagueLogoId(): Promise<string | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT logo_id FROM league_settings WHERE id = 'npl_germany' LIMIT 1
  `;
  const id = (rows[0] as { logo_id: string | null } | undefined)?.logo_id;
  return id ? String(id) : null;
}

export async function setLeagueLogo(mediaId: string): Promise<void> {
  const sql = getSql();
  const previous = await getLeagueLogoId();
  await sql`
    INSERT INTO league_settings (id, logo_id)
    VALUES ('npl_germany', ${mediaId})
    ON CONFLICT (id) DO UPDATE SET logo_id = EXCLUDED.logo_id
  `;
  if (previous && previous !== mediaId) await deleteMedia(previous);
}

function mapFixture(row: Record<string, unknown>): FixtureRow {
  return {
    id: String(row.id),
    season: String(row.season ?? "Season 1"),
    franchise_a_id: String(row.franchise_a_id),
    franchise_b_id: String(row.franchise_b_id),
    ground_name: String(row.ground_name),
    city: String(row.city),
    scheduled_at: asIso(row.scheduled_at),
    status: (row.status as FixtureStatus) ?? "scheduled",
    result_summary: (row.result_summary as string | null) ?? null,
    winner_franchise_id: row.winner_franchise_id ? String(row.winner_franchise_id) : null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
    a_name: String(row.a_name ?? ""),
    a_short: String(row.a_short ?? ""),
    a_city: String(row.a_city ?? ""),
    a_color: String(row.a_color ?? ""),
    b_name: String(row.b_name ?? ""),
    b_short: String(row.b_short ?? ""),
    b_city: String(row.b_city ?? ""),
    b_color: String(row.b_color ?? ""),
    winner_name: row.winner_name ? String(row.winner_name) : null,
  };
}

export async function listFixtures(season = "Season 1"): Promise<FixtureRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT fx.id, fx.season, fx.franchise_a_id, fx.franchise_b_id, fx.ground_name, fx.city,
           fx.scheduled_at::text, fx.status, fx.result_summary, fx.winner_franchise_id,
           fx.created_at::text, fx.updated_at::text,
           a.full_name AS a_name, a.name AS a_short, a.city AS a_city, a.color_key AS a_color,
           b.full_name AS b_name, b.name AS b_short, b.city AS b_city, b.color_key AS b_color,
           w.full_name AS winner_name
    FROM fixtures fx
    JOIN franchises a ON a.id = fx.franchise_a_id
    JOIN franchises b ON b.id = fx.franchise_b_id
    LEFT JOIN franchises w ON w.id = fx.winner_franchise_id
    WHERE fx.season = ${season}
    ORDER BY fx.scheduled_at, fx.id
  `;
  return rows.map((row) => mapFixture(row as Record<string, unknown>));
}

export async function getFixture(id: string): Promise<FixtureRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT fx.id, fx.season, fx.franchise_a_id, fx.franchise_b_id, fx.ground_name, fx.city,
           fx.scheduled_at::text, fx.status, fx.result_summary, fx.winner_franchise_id,
           fx.created_at::text, fx.updated_at::text,
           a.full_name AS a_name, a.name AS a_short, a.city AS a_city, a.color_key AS a_color,
           b.full_name AS b_name, b.name AS b_short, b.city AS b_city, b.color_key AS b_color,
           w.full_name AS winner_name
    FROM fixtures fx
    JOIN franchises a ON a.id = fx.franchise_a_id
    JOIN franchises b ON b.id = fx.franchise_b_id
    LEFT JOIN franchises w ON w.id = fx.winner_franchise_id
    WHERE fx.id = ${id}
    LIMIT 1
  `;
  return rows[0] ? mapFixture(rows[0] as Record<string, unknown>) : null;
}

export type FixtureWriteInput = {
  season: string;
  franchiseAId: string;
  franchiseBId: string;
  groundName: string;
  city: string;
  scheduledAt: Date;
  status: FixtureStatus;
};

export async function createFixture(input: FixtureWriteInput): Promise<string> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO fixtures (
      season, franchise_a_id, franchise_b_id, ground_name, city, scheduled_at, status
    )
    VALUES (
      ${input.season}, ${input.franchiseAId}, ${input.franchiseBId},
      ${input.groundName}, ${input.city}, ${input.scheduledAt.toISOString()}, ${input.status}
    )
    RETURNING id
  `;
  return String((rows[0] as { id: string }).id);
}

export async function updateFixture(id: string, input: FixtureWriteInput): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    UPDATE fixtures
    SET season = ${input.season},
        franchise_a_id = ${input.franchiseAId},
        franchise_b_id = ${input.franchiseBId},
        ground_name = ${input.groundName},
        city = ${input.city},
        scheduled_at = ${input.scheduledAt.toISOString()},
        status = ${input.status},
        updated_at = now()
    WHERE id = ${id}
    RETURNING id
  `;
  return rows.length > 0;
}
