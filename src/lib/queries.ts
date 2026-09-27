import { getSql } from "./db";
import type {
  FranchiseRow,
  PlayerListItem,
  PlayerProfileRow,
  Role,
  SeasonRow,
  SeasonStatus,
  UserRow,
} from "./types";

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
           f.full_name AS franchise_name
    FROM users u
    LEFT JOIN franchise_memberships fm ON fm.user_id = u.id
    LEFT JOIN franchises f ON f.id = fm.franchise_id
    ORDER BY u.role, u.display_name
  `;
  return rows as Array<UserRow & { franchise_name: string | null }>;
}

export async function listFranchises(): Promise<FranchiseRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, slug, city, name, full_name, tagline, description, color_key, sort_order
    FROM franchises
    ORDER BY sort_order, city
  `;
  return rows as FranchiseRow[];
}

export async function getFranchise(id: string): Promise<FranchiseRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, slug, city, name, full_name, tagline, description, color_key, sort_order
    FROM franchises
    WHERE id = ${id}
    LIMIT 1
  `;
  return (rows[0] as FranchiseRow | undefined) ?? null;
}

export async function updateFranchise(
  id: string,
  input: { tagline: string; description: string },
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE franchises
    SET tagline = ${input.tagline}, description = ${input.description}
    WHERE id = ${id}
  `;
}

export async function assignFranchiseOwner(userId: string, franchiseId: string): Promise<void> {
  const sql = getSql();
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
}): Promise<PlayerProfileRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO player_profiles (
      user_id, season_id, full_name, phone, city, playing_role, experience
    )
    VALUES (
      ${input.userId}, ${input.seasonId}, ${input.fullName}, ${input.phone},
      ${input.city}, ${input.playingRole}, ${input.experience}
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
           p.created_at::text, p.updated_at::text,
           u.email, f.full_name AS franchise_name, f.color_key AS franchise_color
    FROM player_profiles p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN franchises f ON f.id = p.franchise_id
    WHERE p.user_id = ${userId}
    LIMIT 1
  `;
  return (rows[0] as PlayerListItem | undefined) ?? null;
}

export async function getProfileById(id: string): Promise<PlayerListItem | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT p.id, p.user_id, p.season_id, p.full_name, p.phone, p.city, p.playing_role,
           p.experience, p.batting_hand, p.bowling_style, p.franchise_id,
           p.created_at::text, p.updated_at::text,
           u.email, f.full_name AS franchise_name, f.color_key AS franchise_color
    FROM player_profiles p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN franchises f ON f.id = p.franchise_id
    WHERE p.id = ${id}
    LIMIT 1
  `;
  return (rows[0] as PlayerListItem | undefined) ?? null;
}

export async function listPlayers(seasonId: string): Promise<PlayerListItem[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT p.id, p.user_id, p.season_id, p.full_name, p.phone, p.city, p.playing_role,
           p.experience, p.batting_hand, p.bowling_style, p.franchise_id,
           p.created_at::text, p.updated_at::text,
           u.email, f.full_name AS franchise_name, f.color_key AS franchise_color
    FROM player_profiles p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN franchises f ON f.id = p.franchise_id
    WHERE p.season_id = ${seasonId}
    ORDER BY p.full_name
  `;
  return rows as PlayerListItem[];
}

export async function updatePlayerProfile(
  id: string,
  input: {
    fullName: string;
    phone: string;
    city: string;
    playingRole: string;
    experience: string;
    battingHand: string | null;
    bowlingStyle: string | null;
    franchiseId?: string | null;
  },
): Promise<void> {
  const sql = getSql();
  if (input.franchiseId !== undefined) {
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
          updated_at = now()
      WHERE id = ${id}
    `;
    return;
  }
  await sql`
    UPDATE player_profiles
    SET full_name = ${input.fullName},
        phone = ${input.phone},
        city = ${input.city},
        playing_role = ${input.playingRole},
        experience = ${input.experience},
        batting_hand = ${input.battingHand},
        bowling_style = ${input.bowlingStyle},
        updated_at = now()
    WHERE id = ${id}
  `;
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
