-- Lynn City Watch — database schema
-- Postgres. All statements are idempotent (safe to run on every boot).
-- Design goals: every fact is source-linked; per-member vote positions are
-- first-class; spending carries its funding-source breakdown so we can compute
-- net local taxpayer cost. `is_sample` flags illustrative rows that must never
-- be presented as real.

-- ---------- issue categories ----------
CREATE TABLE IF NOT EXISTS categories (
  id    SERIAL PRIMARY KEY,
  slug  TEXT UNIQUE NOT NULL,
  name  TEXT NOT NULL,
  sort  INT DEFAULT 100
);

-- ---------- council members ----------
CREATE TABLE IF NOT EXISTS councilors (
  id           TEXT PRIMARY KEY,           -- stable slug, e.g. 'alinsug'
  name         TEXT NOT NULL,
  seat         TEXT NOT NULL,              -- 'Ward 3' | 'At-Large'
  seat_type    TEXT NOT NULL,             -- 'ward' | 'atlarge'
  ward_number  INT,                        -- null for at-large
  title        TEXT DEFAULT '',            -- 'Council President', etc.
  phone        TEXT DEFAULT '',
  email        TEXT DEFAULT '',
  profile_url  TEXT DEFAULT '',
  term_start   DATE,
  term_end     DATE,
  active       BOOLEAN DEFAULT TRUE,
  source_url   TEXT DEFAULT '',
  is_sample    BOOLEAN DEFAULT FALSE
);

-- ---------- meetings ----------
CREATE TABLE IF NOT EXISTS meetings (
  id           SERIAL PRIMARY KEY,
  meeting_date DATE NOT NULL,
  body         TEXT DEFAULT 'City Council', -- council / committee name
  title        TEXT DEFAULT '',
  agenda_url   TEXT DEFAULT '',
  minutes_url  TEXT DEFAULT '',
  video_url    TEXT DEFAULT '',
  source_url   TEXT DEFAULT '',
  is_sample    BOOLEAN DEFAULT FALSE,
  UNIQUE (meeting_date, body, title)
);
-- meeting video fields (Lynn Community TV recordings)
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS youtube_id    TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS published_at  TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS meetings_youtube_id_key ON meetings (youtube_id);

-- ---------- votes / agenda items ----------
CREATE TABLE IF NOT EXISTS votes (
  id                 SERIAL PRIMARY KEY,
  meeting_id         INT REFERENCES meetings(id) ON DELETE CASCADE,
  vote_date          DATE NOT NULL,
  item_number        TEXT DEFAULT '',
  title              TEXT NOT NULL,          -- official item title
  plain_summary      TEXT DEFAULT '',        -- plain-English summary
  category_id        INT REFERENCES categories(id),
  item_type          TEXT DEFAULT '',        -- ordinance/motion/resolution/budget/appointment
  result             TEXT DEFAULT '',        -- e.g. 'Passed 8-3', 'Failed', 'Tabled'
  passed             BOOLEAN,
  is_roll_call       BOOLEAN DEFAULT FALSE,   -- true if per-member positions are recorded
  tally_yes          INT,
  tally_no           INT,
  tally_abstain      INT,
  tally_absent       INT,
  -- spending impact + funding sources (for net local taxpayer cost)
  spending_amount    NUMERIC,                -- total dollars, null if none/unknown
  spending_estimate  BOOLEAN DEFAULT FALSE,
  funding_local      NUMERIC,                -- local property tax + local receipts
  funding_state      NUMERIC,                -- state aid (Cherry Sheet, Ch.70)
  funding_federal    NUMERIC,                -- federal funds/grants
  department         TEXT DEFAULT '',
  effect             TEXT DEFAULT '',        -- expanded/reduced/delayed/redirected
  source_url         TEXT DEFAULT '',
  notes              TEXT DEFAULT '',
  is_sample          BOOLEAN DEFAULT FALSE,
  created_at         TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_votes_date ON votes (vote_date);
CREATE INDEX IF NOT EXISTS idx_votes_category ON votes (category_id);

-- ---------- per-member vote positions (the "how did THIS councilor vote") ----------
CREATE TABLE IF NOT EXISTS vote_positions (
  id           SERIAL PRIMARY KEY,
  vote_id      INT REFERENCES votes(id) ON DELETE CASCADE,
  councilor_id TEXT REFERENCES councilors(id),
  position     TEXT NOT NULL,               -- yes/no/abstain/absent/recused
  UNIQUE (vote_id, councilor_id)
);
CREATE INDEX IF NOT EXISTS idx_positions_councilor ON vote_positions (councilor_id);

-- ---------- budget lines (department spending by fiscal year) ----------
CREATE TABLE IF NOT EXISTS budget_items (
  id           SERIAL PRIMARY KEY,
  fiscal_year  INT NOT NULL,
  department   TEXT NOT NULL,
  category_id  INT REFERENCES categories(id),
  total        NUMERIC NOT NULL,
  federal      NUMERIC DEFAULT 0,
  state        NUMERIC DEFAULT 0,
  local        NUMERIC,                      -- total - federal - state (stored for clarity)
  one_time     BOOLEAN DEFAULT FALSE,        -- one-time vs recurring
  note         TEXT DEFAULT '',
  source_url   TEXT DEFAULT '',
  is_sample    BOOLEAN DEFAULT FALSE,
  UNIQUE (fiscal_year, department)
);

-- ---------- citywide revenue by fiscal year (where all money comes from) ----------
CREATE TABLE IF NOT EXISTS revenue_sources (
  id           SERIAL PRIMARY KEY,
  fiscal_year  INT NOT NULL,
  source       TEXT NOT NULL,
  kind         TEXT NOT NULL,               -- local/state/federal
  amount       NUMERIC NOT NULL,
  note         TEXT DEFAULT '',
  source_url   TEXT DEFAULT '',
  is_sample    BOOLEAN DEFAULT FALSE,
  UNIQUE (fiscal_year, source)
);

-- ---------- document library ----------
CREATE TABLE IF NOT EXISTS documents (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  doc_type     TEXT DEFAULT '',             -- minutes/agenda/budget/audit/contract/notice
  year         INT,
  department   TEXT DEFAULT '',
  topic        TEXT DEFAULT '',
  url          TEXT NOT NULL,
  source       TEXT DEFAULT '',
  is_sample    BOOLEAN DEFAULT FALSE
);

-- ---------- public records requests tracker ----------
CREATE TABLE IF NOT EXISTS records_requests (
  id             SERIAL PRIMARY KEY,
  submitted_date DATE,
  department     TEXT DEFAULT '',
  subject        TEXT DEFAULT '',
  deadline       DATE,
  responded_on   DATE,
  status         TEXT DEFAULT '',           -- pending/provided/denied/partial/appealed
  fee            NUMERIC,
  notes          TEXT DEFAULT ''
);

-- ---------- editorial corrections log ----------
CREATE TABLE IF NOT EXISTS corrections (
  id           SERIAL PRIMARY KEY,
  logged_date  DATE DEFAULT CURRENT_DATE,
  summary      TEXT NOT NULL,
  detail       TEXT DEFAULT ''
);
