export const ROLES = ["player", "franchise_owner", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const PLAYING_ROLES = ["Batter", "Bowler", "All-rounder", "Wicketkeeper"] as const;
export type PlayingRole = (typeof PLAYING_ROLES)[number];

export const EXPERIENCE_LEVELS = [
  "New to organised cricket",
  "Played club cricket in Nepal",
  "Playing club cricket in Germany already",
  "Representative / district level experience",
  "Deuce-ball league experience",
] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const SEASON_STATUSES = ["registration", "auction", "active", "completed"] as const;
export type SeasonStatus = (typeof SEASON_STATUSES)[number];

export const ELIGIBILITY_STATUSES = ["pending", "confirmed", "rejected"] as const;
export type EligibilityStatus = (typeof ELIGIBILITY_STATUSES)[number];

export const STATS_SOURCES = ["none", "cricheroes", "manual"] as const;
export type StatsSource = (typeof STATS_SOURCES)[number];

export const BATTING_HANDS = ["Right", "Left"] as const;
export const BOWLING_STYLES = [
  "Right-arm medium",
  "Right-arm fast",
  "Left-arm medium",
  "Left-arm fast",
  "Off spin",
  "Leg spin",
  "Does not bowl",
] as const;

export type SessionUser = {
  userId: string;
  email: string;
  role: Role;
  displayName: string;
};

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  role: Role;
  display_name: string;
  created_at: string;
};

export type FranchiseRow = {
  id: string;
  slug: string;
  city: string;
  name: string;
  full_name: string;
  tagline: string;
  description: string;
  color_key: string;
  sort_order: number;
  logo_id: string | null;
};

export type SeasonRow = {
  id: string;
  name: string;
  year: number;
  ball_type: string;
  status: SeasonStatus;
  is_current: boolean;
};

export type PlayerProfileRow = {
  id: string;
  user_id: string;
  season_id: string;
  full_name: string;
  phone: string | null;
  city: string;
  playing_role: PlayingRole;
  experience: string;
  batting_hand: string | null;
  bowling_style: string | null;
  franchise_id: string | null;
  nepali_citizen: boolean;
  germany_legal_resident: boolean;
  eligibility_status: EligibilityStatus;
  eligibility_reviewed_at: string | null;
  cricheroes_url: string | null;
  stats_source: StatsSource;
  stats_matches: number | null;
  stats_runs: number | null;
  stats_wickets: number | null;
  stats_batting_avg: number | null;
  stats_strike_rate: number | null;
  stats_economy: number | null;
  stats_high_score: number | null;
  stats_best_bowling: string | null;
  stats_fetched_at: string | null;
  photo_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PlayerListItem = PlayerProfileRow & {
  email: string;
  franchise_name: string | null;
  franchise_color: string | null;
};

export type FieldErrors = Record<string, string>;
