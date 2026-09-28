-- NPL Germany Season 1 — Neon Postgres
-- Season 1 sport is deuce ball. Apply with: npm run db:setup

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'franchise_owner', 'admin')),
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
  sort_order int NOT NULL DEFAULT 0,
  owner_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  purse_total integer NOT NULL DEFAULT 50000,
  purse_spent integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
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
  nepali_citizen boolean NOT NULL DEFAULT false,
  germany_legal_resident boolean NOT NULL DEFAULT false,
  eligibility_status text NOT NULL DEFAULT 'pending',
  eligibility_reviewed_at timestamptz,
  cricheroes_url text,
  stats_source text NOT NULL DEFAULT 'none',
  stats_matches integer,
  stats_runs integer,
  stats_wickets integer,
  stats_batting_avg numeric,
  stats_strike_rate numeric,
  stats_economy numeric,
  stats_high_score integer,
  stats_best_bowling text,
  stats_fetched_at timestamptz,
  auction_status text NOT NULL DEFAULT 'pending_review'
    CHECK (auction_status IN (
      'pending_review', 'approved', 'rejected', 'in_auction_pool', 'sold', 'unsold'
    )),
  base_price integer,
  sold_to_franchise_id uuid REFERENCES franchises(id) ON DELETE SET NULL,
  sold_price integer,
  auction_order integer,
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
CREATE INDEX IF NOT EXISTS player_profiles_eligibility_idx ON player_profiles (eligibility_status);

ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS nepali_citizen boolean NOT NULL DEFAULT false;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS germany_legal_resident boolean NOT NULL DEFAULT false;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS eligibility_status text NOT NULL DEFAULT 'pending';
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS eligibility_reviewed_at timestamptz;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS cricheroes_url text;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS stats_source text NOT NULL DEFAULT 'none';
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS stats_matches integer;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS stats_runs integer;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS stats_wickets integer;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS stats_batting_avg numeric;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS stats_strike_rate numeric;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS stats_economy numeric;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS stats_high_score integer;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS stats_best_bowling text;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS stats_fetched_at timestamptz;

CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN (
    'player_photo', 'franchise_logo', 'league_logo',
    'passport', 'residence_permit', 'health_insurance'
  )),
  mime_type text NOT NULL,
  bytes bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE media_assets DROP CONSTRAINT IF EXISTS media_assets_kind_check;
ALTER TABLE media_assets ADD CONSTRAINT media_assets_kind_check
  CHECK (kind IN (
    'player_photo', 'franchise_logo', 'league_logo',
    'passport', 'residence_permit', 'health_insurance'
  ));

ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS photo_id uuid REFERENCES media_assets(id) ON DELETE SET NULL;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS passport_id uuid REFERENCES media_assets(id) ON DELETE SET NULL;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS residence_permit_id uuid REFERENCES media_assets(id) ON DELETE SET NULL;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS health_insurance_id uuid REFERENCES media_assets(id) ON DELETE SET NULL;
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS logo_id uuid REFERENCES media_assets(id) ON DELETE SET NULL;
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'player';

CREATE UNIQUE INDEX IF NOT EXISTS franchises_one_owner
  ON franchises (owner_user_id)
  WHERE owner_user_id IS NOT NULL;

ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS auction_status text NOT NULL DEFAULT 'pending_review';
ALTER TABLE player_profiles DROP CONSTRAINT IF EXISTS player_profiles_auction_status_check;
ALTER TABLE player_profiles ADD CONSTRAINT player_profiles_auction_status_check
  CHECK (auction_status IN (
    'pending_review', 'approved', 'rejected', 'in_auction_pool', 'sold', 'unsold'
  ));
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS base_price integer;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS sold_to_franchise_id uuid REFERENCES franchises(id) ON DELETE SET NULL;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS sold_price integer;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS auction_order integer;
CREATE INDEX IF NOT EXISTS player_profiles_auction_status_idx ON player_profiles (auction_status);
CREATE INDEX IF NOT EXISTS player_profiles_sold_to_idx ON player_profiles (sold_to_franchise_id);

ALTER TABLE franchises ADD COLUMN IF NOT EXISTS purse_total integer NOT NULL DEFAULT 50000;
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS purse_spent integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS league_settings (
  id text PRIMARY KEY,
  logo_id uuid REFERENCES media_assets(id) ON DELETE SET NULL,
  auction_player_id uuid REFERENCES player_profiles(id) ON DELETE SET NULL,
  auction_closed boolean NOT NULL DEFAULT false
);

INSERT INTO league_settings (id)
SELECT 'npl_germany'
WHERE NOT EXISTS (SELECT 1 FROM league_settings WHERE id = 'npl_germany');

ALTER TABLE league_settings ADD COLUMN IF NOT EXISTS auction_player_id uuid REFERENCES player_profiles(id) ON DELETE SET NULL;
ALTER TABLE league_settings ADD COLUMN IF NOT EXISTS auction_closed boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx ON password_reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_hash_idx ON password_reset_tokens (token_hash);

CREATE TABLE IF NOT EXISTS fixtures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season text NOT NULL DEFAULT 'Season 1',
  franchise_a_id uuid NOT NULL REFERENCES franchises(id),
  franchise_b_id uuid NOT NULL REFERENCES franchises(id),
  ground_name text NOT NULL,
  city text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'live', 'completed', 'abandoned')),
  result_summary text,
  winner_franchise_id uuid REFERENCES franchises(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (franchise_a_id <> franchise_b_id)
);

CREATE INDEX IF NOT EXISTS fixtures_scheduled_idx ON fixtures (scheduled_at);
CREATE INDEX IF NOT EXISTS fixtures_season_idx ON fixtures (season);
CREATE INDEX IF NOT EXISTS fixtures_status_idx ON fixtures (status);
