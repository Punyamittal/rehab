-- =============================================================================
-- REHAB Learning Platform — Supabase / PostgreSQL schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- ENUMS (match src/types/index.ts)
-- -----------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM (
  'student',
  'facilitator',
  'volunteer',
  'admin'
);

CREATE TYPE ui_language AS ENUM ('hi', 'en', 'pa', 'bho', 'hr');

CREATE TYPE module_topic AS ENUM (
  'addiction',
  'communication',
  'hygiene',
  'emotional_intelligence',
  'confidence',
  'health',
  'safety',
  'peer_pressure',
  'self_esteem'
);

CREATE TYPE emotion_type AS ENUM (
  'happy',
  'anxious',
  'sad',
  'angry',
  'confused',
  'calm'
);

CREATE TYPE check_type AS ENUM ('pre', 'post');

CREATE TYPE story_format AS ENUM ('branching', 'interactive');

CREATE TYPE game_type AS ENUM (
  'scenario_hero',
  'emotion_match',
  'safe_or_not',
  'calm_breath',
  'habit_match'
);

CREATE TYPE points_bucket AS ENUM ('assessment', 'game');

-- -----------------------------------------------------------------------------
-- CENTRES
-- -----------------------------------------------------------------------------

CREATE TABLE centres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- PROFILES (extends auth.users — create profile on signup via trigger)
-- -----------------------------------------------------------------------------

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'facilitator',
  centre_id UUID REFERENCES centres(id) ON DELETE SET NULL,
  display_name TEXT,
  preferred_language ui_language NOT NULL DEFAULT 'hi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- STUDENTS (pseudonymous learners at a centre)
-- -----------------------------------------------------------------------------

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  avatar_emoji TEXT NOT NULL DEFAULT '🌸',
  facilitator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  present_today BOOLEAN NOT NULL DEFAULT FALSE,
  current_note TEXT,
  assessment_points INT NOT NULL DEFAULT 0 CHECK (assessment_points >= 0),
  game_points INT NOT NULL DEFAULT 0 CHECK (game_points >= 0),
  -- Optional snapshot for migrating from device localStorage
  session_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT students_alias_unique_per_centre UNIQUE (centre_id, alias)
);

-- Generated total for dashboard sorting
ALTER TABLE students
  ADD COLUMN total_points INT GENERATED ALWAYS AS (assessment_points + game_points) STORED;

-- -----------------------------------------------------------------------------
-- LEARNING MODULES (content catalog; app also ships static JSON)
-- -----------------------------------------------------------------------------

CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_hi TEXT NOT NULL,
  title_en TEXT,
  description_hi TEXT,
  description_en TEXT,
  topic module_topic NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 5 CHECK (duration_minutes > 0),
  emoji TEXT DEFAULT '📘',
  content_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- MODULE PROGRESS (per student; keyed by slug for app compatibility)
-- API: POST /api/modules/[slug]/progress
-- -----------------------------------------------------------------------------

CREATE TABLE module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_slug TEXT NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  checkpoint_index INT NOT NULL DEFAULT 0 CHECK (checkpoint_index >= 0),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  score INT CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, module_slug)
);

-- -----------------------------------------------------------------------------
-- BRANCHING / INTERACTIVE STORIES
-- -----------------------------------------------------------------------------

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_hi TEXT NOT NULL,
  title_en TEXT,
  description_hi TEXT,
  description_en TEXT,
  topic module_topic,
  duration_minutes INT NOT NULL DEFAULT 10,
  emoji TEXT DEFAULT '📖',
  format story_format NOT NULL DEFAULT 'branching',
  start_node_id TEXT,
  graph_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  scenes_json JSONB,
  facilitator_prompts_hi TEXT[],
  facilitator_prompts_en TEXT[],
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  story_slug TEXT NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  last_scene_id TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  choices_made JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, story_slug)
);

-- -----------------------------------------------------------------------------
-- GAMES
-- -----------------------------------------------------------------------------

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  game_type game_type NOT NULL,
  title_hi TEXT NOT NULL,
  title_en TEXT,
  description_hi TEXT,
  description_en TEXT,
  topic module_topic,
  duration_minutes INT NOT NULL DEFAULT 5,
  emoji TEXT DEFAULT '🎮',
  skills_hi TEXT[] DEFAULT '{}',
  skills_en TEXT[] DEFAULT '{}',
  config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  game_slug TEXT NOT NULL,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  best_score INT NOT NULL DEFAULT 0 CHECK (best_score >= 0 AND best_score <= 100),
  last_score INT NOT NULL DEFAULT 0 CHECK (last_score >= 0 AND last_score <= 100),
  plays INT NOT NULL DEFAULT 0 CHECK (plays >= 0),
  last_played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, game_slug)
);

-- -----------------------------------------------------------------------------
-- EMOTION CHECK-INS
-- API: POST /api/emotions
-- -----------------------------------------------------------------------------

CREATE TABLE emotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_slug TEXT,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  story_slug TEXT,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  check_type check_type NOT NULL,
  emotion emotion_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- ATTENDANCE (one row per student per day)
-- -----------------------------------------------------------------------------

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'Asia/Kolkata')::date,
  present BOOLEAN NOT NULL DEFAULT TRUE,
  marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, session_date)
);

-- -----------------------------------------------------------------------------
-- FACILITATOR NOTES (history; students.current_note = latest shortcut)
-- -----------------------------------------------------------------------------

CREATE TABLE facilitator_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  facilitator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  session_date DATE NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'Asia/Kolkata')::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- POINTS LEDGER (audit trail for assessment / game awards)
-- -----------------------------------------------------------------------------

CREATE TABLE points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  facilitator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  bucket points_bucket NOT NULL,
  points INT NOT NULL,
  reason TEXT,
  module_slug TEXT,
  game_slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- VOLUNTEER GUIDANCE SESSIONS
-- -----------------------------------------------------------------------------

CREATE TABLE guidance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_slug TEXT,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  title_hi TEXT NOT NULL,
  title_en TEXT,
  duration_minutes INT NOT NULL DEFAULT 15,
  steps_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------

CREATE INDEX idx_profiles_centre ON profiles(centre_id);
CREATE INDEX idx_students_centre ON students(centre_id);
CREATE INDEX idx_students_facilitator ON students(facilitator_id);
CREATE INDEX idx_module_progress_student ON module_progress(student_id);
CREATE INDEX idx_module_progress_slug ON module_progress(module_slug);
CREATE INDEX idx_game_scores_student ON game_scores(student_id);
CREATE INDEX idx_emotion_logs_student ON emotion_logs(student_id);
CREATE INDEX idx_emotion_logs_created ON emotion_logs(created_at DESC);
CREATE INDEX idx_attendance_centre_date ON attendance(centre_id, session_date);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, session_date);
CREATE INDEX idx_facilitator_notes_student ON facilitator_notes(student_id);
CREATE INDEX idx_points_ledger_student ON points_ledger(student_id);
CREATE INDEX idx_story_progress_student ON story_progress(student_id);

-- -----------------------------------------------------------------------------
-- UPDATED_AT TRIGGERS
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_centres_updated_at
  BEFORE UPDATE ON centres FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_modules_updated_at
  BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_module_progress_updated_at
  BEFORE UPDATE ON module_progress FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_stories_updated_at
  BEFORE UPDATE ON stories FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_story_progress_updated_at
  BEFORE UPDATE ON story_progress FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_games_updated_at
  BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_game_scores_updated_at
  BEFORE UPDATE ON game_scores FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_attendance_updated_at
  BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_guidance_sessions_updated_at
  BEFORE UPDATE ON guidance_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create profile when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Sync module_id from slug when possible
CREATE OR REPLACE FUNCTION link_module_progress_module_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.module_id IS NULL AND NEW.module_slug IS NOT NULL THEN
    SELECT id INTO NEW.module_id FROM modules WHERE slug = NEW.module_slug LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_module_progress_link_module
  BEFORE INSERT OR UPDATE ON module_progress
  FOR EACH ROW EXECUTE FUNCTION link_module_progress_module_id();

-- Award points + ledger entry
CREATE OR REPLACE FUNCTION award_student_points(
  p_student_id UUID,
  p_bucket points_bucket,
  p_points INT,
  p_facilitator_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_module_slug TEXT DEFAULT NULL,
  p_game_slug TEXT DEFAULT NULL
)
RETURNS students
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result students;
BEGIN
  IF p_points = 0 THEN
    SELECT * INTO result FROM students WHERE id = p_student_id;
    RETURN result;
  END IF;

  UPDATE students
  SET
    assessment_points = CASE
      WHEN p_bucket = 'assessment' THEN GREATEST(0, assessment_points + p_points)
      ELSE assessment_points
    END,
    game_points = CASE
      WHEN p_bucket = 'game' THEN GREATEST(0, game_points + p_points)
      ELSE game_points
    END
  WHERE id = p_student_id
  RETURNING * INTO result;

  INSERT INTO points_ledger (
    student_id, facilitator_id, bucket, points, reason, module_slug, game_slug
  ) VALUES (
    p_student_id, p_facilitator_id, p_bucket, p_points, p_reason, p_module_slug, p_game_slug
  );

  RETURN result;
END;
$$;

-- Upsert game score (normalized 0–100)
CREATE OR REPLACE FUNCTION record_game_score(
  p_student_id UUID,
  p_game_slug TEXT,
  p_score INT,
  p_max_score INT DEFAULT 100
)
RETURNS game_scores
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized INT;
  result game_scores;
  gid UUID;
BEGIN
  normalized := CASE
    WHEN p_max_score <= 0 THEN 0
    ELSE LEAST(100, GREATEST(0, ROUND((p_score::numeric / p_max_score) * 100)))
  END;

  SELECT id INTO gid FROM games WHERE slug = p_game_slug LIMIT 1;

  INSERT INTO game_scores (
    student_id, game_slug, game_id, best_score, last_score, plays, last_played_at
  ) VALUES (
    p_student_id, p_game_slug, gid, normalized, normalized, 1, NOW()
  )
  ON CONFLICT (student_id, game_slug) DO UPDATE SET
    best_score = GREATEST(game_scores.best_score, EXCLUDED.best_score),
    last_score = EXCLUDED.last_score,
    plays = game_scores.plays + 1,
    last_played_at = NOW(),
    game_id = COALESCE(EXCLUDED.game_id, game_scores.game_id)
  RETURNING * INTO result;

  RETURN result;
END;
$$;

-- Facilitator dashboard view
CREATE OR REPLACE VIEW facilitator_student_dashboard AS
SELECT
  s.id AS student_id,
  s.centre_id,
  s.alias,
  s.avatar_emoji,
  s.present_today,
  s.current_note,
  s.assessment_points,
  s.game_points,
  s.total_points,
  COUNT(mp.id) FILTER (WHERE mp.completed) AS modules_completed,
  (
    SELECT e.emotion
    FROM emotion_logs e
    WHERE e.student_id = s.id
    ORDER BY e.created_at DESC
    LIMIT 1
  ) AS last_emotion,
  (
    SELECT e.emotion
    FROM emotion_logs e
    WHERE e.student_id = s.id AND e.check_type = 'pre'
    ORDER BY e.created_at DESC
    LIMIT 1
  ) AS pre_emotion
FROM students s
LEFT JOIN module_progress mp ON mp.student_id = s.id
WHERE s.is_active = TRUE
GROUP BY s.id;

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------

ALTER TABLE centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilitator_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE guidance_sessions ENABLE ROW LEVEL SECURITY;

-- Helper: current user's centre
CREATE OR REPLACE FUNCTION auth_user_centre_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT centre_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Profiles: users read/update self; admins read all
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (id = auth.uid() OR auth_user_role() = 'admin');

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Published content: readable by any authenticated user
CREATE POLICY modules_read_published ON modules
  FOR SELECT USING (is_published = TRUE OR auth_user_role() IN ('facilitator', 'admin'));

CREATE POLICY stories_read_published ON stories
  FOR SELECT USING (is_published = TRUE OR auth_user_role() IN ('facilitator', 'admin', 'volunteer'));

CREATE POLICY games_read_published ON games
  FOR SELECT USING (is_published = TRUE OR auth_user_role() IN ('facilitator', 'admin'));

CREATE POLICY guidance_read_published ON guidance_sessions
  FOR SELECT USING (is_published = TRUE OR auth_user_role() IN ('facilitator', 'admin', 'volunteer'));

-- Centres: staff of centre can read
CREATE POLICY centres_read_staff ON centres
  FOR SELECT USING (
    auth_user_role() = 'admin'
    OR id = auth_user_centre_id()
  );

-- Students: facilitators/volunteers in same centre
CREATE POLICY students_select_centre ON students
  FOR SELECT USING (
    auth_user_role() = 'admin'
    OR centre_id = auth_user_centre_id()
  );

CREATE POLICY students_insert_facilitator ON students
  FOR INSERT WITH CHECK (
    auth_user_role() IN ('facilitator', 'admin')
    AND (auth_user_role() = 'admin' OR centre_id = auth_user_centre_id())
  );

CREATE POLICY students_update_facilitator ON students
  FOR UPDATE USING (
    auth_user_role() = 'admin'
    OR centre_id = auth_user_centre_id()
  );

CREATE POLICY students_delete_facilitator ON students
  FOR DELETE USING (
    auth_user_role() IN ('facilitator', 'admin')
    AND (auth_user_role() = 'admin' OR centre_id = auth_user_centre_id())
  );

-- Progress & logs: centre staff read/write; anon blocked
CREATE POLICY module_progress_centre ON module_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = module_progress.student_id
        AND (s.centre_id = auth_user_centre_id() OR auth_user_role() = 'admin')
    )
  );

CREATE POLICY game_scores_centre ON game_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = game_scores.student_id
        AND (s.centre_id = auth_user_centre_id() OR auth_user_role() = 'admin')
    )
  );

CREATE POLICY emotion_logs_centre ON emotion_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = emotion_logs.student_id
        AND (s.centre_id = auth_user_centre_id() OR auth_user_role() = 'admin')
    )
  );

CREATE POLICY story_progress_centre ON story_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = story_progress.student_id
        AND (s.centre_id = auth_user_centre_id() OR auth_user_role() = 'admin')
    )
  );

CREATE POLICY attendance_centre ON attendance
  FOR ALL USING (
    centre_id = auth_user_centre_id() OR auth_user_role() = 'admin'
  );

CREATE POLICY facilitator_notes_centre ON facilitator_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = facilitator_notes.student_id
        AND (s.centre_id = auth_user_centre_id() OR auth_user_role() = 'admin')
    )
  );

CREATE POLICY points_ledger_centre ON points_ledger
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = points_ledger.student_id
        AND (s.centre_id = auth_user_centre_id() OR auth_user_role() = 'admin')
    )
  );

-- Service role bypasses RLS for API routes using SUPABASE_SERVICE_ROLE_KEY
