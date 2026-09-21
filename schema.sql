-- Run this in the Supabase SQL editor to set up the database schema.

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    TEXT UNIQUE NOT NULL,
  home_type   TEXT,
  home_lng    DOUBLE PRECISION,
  home_lat    DOUBLE PRECISION,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- One user can have many sessions (multi-device support)
CREATE TABLE sessions (
  token       TEXT PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE spots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  lng         DOUBLE PRECISION NOT NULL,
  lat         DOUBLE PRECISION NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Run this if you already created the table without home columns:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS home_type TEXT;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS home_lng DOUBLE PRECISION;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS home_lat DOUBLE PRECISION;

CREATE TABLE routes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT '',
  colour      TEXT NOT NULL DEFAULT '#3b82f6',
  description TEXT NOT NULL DEFAULT '',
  waypoints   JSONB NOT NULL DEFAULT '[]',
  geometry    JSONB NOT NULL DEFAULT '[]',
  distance    DOUBLE PRECISION,
  duration    DOUBLE PRECISION,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
