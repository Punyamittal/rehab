-- REHAB Learning Platform — Supabase Schema
-- Run in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('student', 'facilitator', 'volunteer', 'admin');
CREATE TYPE module_topic AS ENUM (
  'addiction', 'communication', 'hygiene', 'emotional_intelligence',
  'confidence', 'health', 'safety', 'peer_pressure', 'self_esteem'
);
CREATE TYPE emotion_type AS ENUM ('happy', 'anxious', 'sad', 'angry', 'confused', 'calm');
CREATE TYPE check_type AS ENUM ('pre', 'post');

-- Centres
CREATE TABLE centres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (links to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  centre_id UUID REFERENCES centres(id),
  display_name TEXT,
  preferred_language TEXT DEFAULT 'hi',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students (pseudonymous)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES centres(id),
  alias TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '🌸',
  facilitator_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning modules
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title_hi TEXT NOT NULL,
  title_en TEXT,
  description_hi TEXT,
  topic module_topic NOT NULL,
  duration_minutes INT DEFAULT 5,
  content_json JSONB NOT NULL DEFAULT '[]',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module progress
CREATE TABLE module_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  checkpoint_index INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  score INT,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);

-- Branching stories
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title_hi TEXT NOT NULL,
  title_en TEXT,
  topic module_topic,
  start_node_id TEXT NOT NULL,
  graph_json JSONB NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emotion check-ins
CREATE TABLE emotion_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id),
  story_id UUID REFERENCES stories(id),
  check_type check_type NOT NULL,
  emotion emotion_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  centre_id UUID NOT NULL REFERENCES centres(id),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  present BOOLEAN NOT NULL DEFAULT true,
  marked_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, session_date)
);

-- Facilitator notes
CREATE TABLE facilitator_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  facilitator_id UUID NOT NULL REFERENCES profiles(id),
  note TEXT NOT NULL,
  session_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Volunteer guidance sessions
CREATE TABLE guidance_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id),
  title_hi TEXT NOT NULL,
  title_en TEXT,
  duration_minutes INT DEFAULT 15,
  steps_json JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_module_progress_student ON module_progress(student_id);
CREATE INDEX idx_emotion_logs_student ON emotion_logs(student_id);
CREATE INDEX idx_emotion_logs_created ON emotion_logs(created_at);
CREATE INDEX idx_attendance_date ON attendance(session_date);

-- RLS (enable and add policies in production)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;

-- Example policy: facilitators read students in their centre
-- CREATE POLICY facilitator_read_students ON students
--   FOR SELECT USING (
--     centre_id IN (SELECT centre_id FROM profiles WHERE id = auth.uid() AND role IN ('facilitator', 'admin'))
--   );
