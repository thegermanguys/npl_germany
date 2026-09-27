export const ROLES = ["player", "franchise_owner", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const PLAYING_ROLES = ["Batter", "Bowler", "All-rounder", "Wicketkeeper"] as const;
export type PlayingRole = (typeof PLAYING_ROLES)[number];

export const CITIES = [
  "Frankfurt",
  "Munich",
  "Berlin",
  "Hamburg",
  "Cologne",
  "Stuttgart",
  "Other city",
] as const;
export type City = (typeof CITIES)[number];

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
  created_at: string;
  updated_at: string;
};

export type PlayerListItem = PlayerProfileRow & {
  email: string;
  franchise_name: string | null;
  franchise_color: string | null;
};

export type FieldErrors = Record<string, string>;
