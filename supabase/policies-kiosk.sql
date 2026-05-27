-- =============================================================================
-- Kiosk / tablet policies — run AFTER schema.sql
-- Allows the app to read/write using the anon key (no Supabase login).
-- Service role key bypasses RLS and does not need this file.
-- =============================================================================

-- Students & centre data
CREATE POLICY kiosk_students_all ON students
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY kiosk_centres_read ON centres
  FOR SELECT TO anon, authenticated
  USING (true);

-- Learning content (read)
CREATE POLICY kiosk_modules_read ON modules
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY kiosk_games_read ON games
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY kiosk_stories_read ON stories
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY kiosk_guidance_read ON guidance_sessions
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

-- Per-student activity
CREATE POLICY kiosk_module_progress ON module_progress
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY kiosk_game_scores ON game_scores
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY kiosk_emotion_logs ON emotion_logs
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY kiosk_story_progress ON story_progress
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY kiosk_points_ledger ON points_ledger
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY kiosk_attendance ON attendance
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY kiosk_facilitator_notes ON facilitator_notes
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);
