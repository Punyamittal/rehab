-- =============================================================================
-- REHAB — Optional seed data (run AFTER schema.sql)
-- =============================================================================

INSERT INTO centres (id, name, location)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'REHAB Demo Centre',
  'India'
)
ON CONFLICT (id) DO NOTHING;

-- Module catalog (slugs match src/data/modules.ts)
INSERT INTO modules (slug, title_hi, title_en, topic, duration_minutes, emoji, is_published, sort_order)
VALUES
  ('peer-pressure', 'साथियों का दबाव', 'Peer Pressure', 'peer_pressure', 4, '🤝', TRUE, 1),
  ('addiction-awareness', 'नशे से जागरूकता', 'Addiction Awareness', 'addiction', 5, '🚫', TRUE, 2),
  ('hygiene-basics', 'स्वच्छता की आदतें', 'Hygiene Basics', 'hygiene', 4, '🧼', TRUE, 3),
  ('emotional-intelligence', 'भावनाओं को समझना', 'Understanding Emotions', 'emotional_intelligence', 5, '💛', TRUE, 4)
ON CONFLICT (slug) DO NOTHING;

-- Games (slugs match src/data/games.ts ids)
INSERT INTO games (slug, game_type, title_hi, title_en, topic, duration_minutes, emoji, is_published)
VALUES
  ('scenario-hero', 'scenario_hero', 'सही फैसला', 'Right Choice', 'peer_pressure', 5, '🦸', TRUE),
  ('emotion-match', 'emotion_match', 'भावना पहचान', 'Emotion Match', 'emotional_intelligence', 4, '🎭', TRUE),
  ('safe-or-not', 'safe_or_not', 'सुरक्षित या नहीं', 'Safe or Not', 'safety', 4, '🛡️', TRUE),
  ('calm-breath', 'calm_breath', 'शांत साँस', 'Calm Breath', 'emotional_intelligence', 3, '🌬️', TRUE),
  ('habit-match', 'habit_match', 'अच्छी आदतें', 'Good Habits', 'hygiene', 5, '✨', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Demo students (UUIDs for Supabase; map from local demo ids when syncing)
INSERT INTO students (id, centre_id, alias, avatar_emoji, present_today, current_note, assessment_points, game_points)
VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    'बुलबुल', '🌸', TRUE, 'आज सक्रिय भागीदारी', 5, 10
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000001',
    'गुलाब', '🌹', TRUE, NULL, 0, 5
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    '00000000-0000-4000-8000-000000000001',
    'चमेली', '🌼', FALSE, NULL, 0, 0
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    '00000000-0000-4000-8000-000000000001',
    'कमल', '🪷', TRUE, 'सभी मॉड्यूल पूरे', 15, 20
  )
ON CONFLICT (id) DO NOTHING;
