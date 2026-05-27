# Supabase setup

## 1. Create project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Copy **Project URL** and **anon public** key

## 2. Run SQL

In **SQL Editor**, run in order:

1. `schema.sql` — tables, indexes, RLS, functions, views
2. `seed.sql` — optional demo centre, modules, games, students

## 3. Environment variables

Add to `rehab-platform/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_CENTRE_ID=00000000-0000-4000-8000-000000000001
```

`SUPABASE_SERVICE_ROLE_KEY` is **required** — all app data goes through API routes using this key (Dashboard → Settings → API).

## 4. Auth (facilitators)

Enable **Email** or **Magic Link** under Authentication → Providers.  
On first login, `handle_new_user` creates a row in `profiles`. Set `role` and `centre_id` in the dashboard or SQL:

```sql
UPDATE profiles
SET role = 'facilitator', centre_id = '00000000-0000-4000-8000-000000000001'
WHERE id = 'YOUR_AUTH_USER_UUID';
```

## Tables overview

| Table | Purpose |
|-------|---------|
| `centres` | Rehabilitation centres |
| `profiles` | Staff roles (links `auth.users`) |
| `students` | Child profiles, notes, points, `session_data` JSON |
| `modules` | Learning module catalog |
| `module_progress` | Per-student module completion |
| `stories` | Branching / interactive stories |
| `story_progress` | Per-student story state |
| `games` | Game catalog |
| `game_scores` | Best / last scores per game |
| `emotion_logs` | Pre/post check-ins |
| `attendance` | Daily presence |
| `facilitator_notes` | Note history |
| `points_ledger` | Point award audit trail |
| `guidance_sessions` | Volunteer facilitation scripts |

## RPC helpers

```sql
-- Award +5 assessment points
SELECT award_student_points(
  '10000000-0000-4000-8000-000000000001'::uuid,
  'assessment',
  5,
  auth.uid(),
  'Module quiz'
);

-- Record game result (score 8 of 10 → 80%)
SELECT record_game_score(
  '10000000-0000-4000-8000-000000000001'::uuid,
  'emotion-match',
  8,
  10
);
```

## API alignment

Existing routes expect:

- `module_progress`: use `module_slug` (e.g. `peer-pressure`) — not UUID
- `emotion_logs`: `student_id`, `check_type`, `emotion`, optional `module_slug` / `story_slug`

Update `src/app/api/modules/[id]/progress/route.ts` to send `module_slug` instead of `module_id` when you wire the client.
