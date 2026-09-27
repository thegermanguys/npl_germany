-- NPL Germany Season 1 — Neon Postgres
-- Season 1 sport is deuce ball. Apply with: npm run db:setup

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('player', 'franchise_owner', 'admin')),
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS franchises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  city text NOT NULL,
  name text NOT NULL,
  full_name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  color_key text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  year int NOT NULL,
  ball_type text NOT NULL DEFAULT 'deuce',
  status text NOT NULL DEFAULT 'registration'
    CHECK (status IN ('registration', 'auction', 'active', 'completed')),
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS seasons_one_current
  ON seasons (is_current)
  WHERE is_current;

CREATE TABLE IF NOT EXISTS player_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  season_id uuid NOT NULL REFERENCES seasons(id),
  full_name text NOT NULL,
  phone text,
  city text NOT NULL,
  playing_role text NOT NULL
    CHECK (playing_role IN ('Batter', 'Bowler', 'All-rounder', 'Wicketkeeper')),
  experience text NOT NULL,
  batting_hand text,
  bowling_style text,
  franchise_id uuid REFERENCES franchises(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS franchise_memberships (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  franchise_id uuid NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, franchise_id)
);

CREATE INDEX IF NOT EXISTS player_profiles_season_idx ON player_profiles (season_id);
CREATE INDEX IF NOT EXISTS player_profiles_city_idx ON player_profiles (city);
CREATE INDEX IF NOT EXISTS player_profiles_role_idx ON player_profiles (playing_role);
