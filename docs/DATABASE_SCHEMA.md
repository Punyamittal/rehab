# Database Schema

PostgreSQL via Supabase. All tables use UUID primary keys and `created_at` timestamps.

## Entity Relationship (Simplified)

```
centres ──┬── students ──┬── module_progress
          │              ├── emotion_logs
          │              └── attendance
          │
          ├── users (facilitators/volunteers)
          └── facilitator_notes

modules ── lessons ── checkpoints
stories ── story_nodes ── story_choices
guidance_sessions ── guidance_steps
```

## Tables

### centres
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | Centre name |
| location | text | Optional |
| created_at | timestamptz | |

### users (extends Supabase auth.users)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | FK auth.users |
| role | enum | student, facilitator, volunteer, admin |
| centre_id | uuid FK | Nullable for admin |
| display_name | text | |
| preferred_language | text | hi, en (default hi) |

### students
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| centre_id | uuid FK | |
| alias | text | Pseudonym (e.g. "बुलबुल") |
| avatar_emoji | text | |
| facilitator_id | uuid FK users | Optional |
| created_at | timestamptz | |

### modules
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| slug | text UNIQUE | |
| title_hi | text | Hindi title |
| title_en | text | |
| topic | enum | addiction, communication, hygiene, etc. |
| duration_minutes | int | 3–5 |
| content_json | jsonb | Slides, quizzes, checkpoints |
| is_published | boolean | |

### module_progress
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| student_id | uuid FK | |
| module_id | uuid FK | |
| checkpoint_index | int | |
| completed | boolean | |
| score | int | Optional quiz score |
| completed_at | timestamptz | |

### stories
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| slug | text | |
| title_hi | text | |
| topic | text | |
| start_node_id | text | References node in graph |
| graph_json | jsonb | Full branching graph |

### emotion_logs
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| student_id | uuid FK | |
| module_id | uuid FK | Nullable |
| check_type | enum | pre, post |
| emotion | enum | happy, anxious, sad, angry, confused, calm |
| color | text | Hex for visualization |
| created_at | timestamptz | |

### attendance
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| student_id | uuid FK | |
| centre_id | uuid FK | |
| session_date | date | |
| present | boolean | |
| marked_by | uuid FK users | |

### facilitator_notes
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| student_id | uuid FK | |
| facilitator_id | uuid FK | |
| note | text | |
| session_date | date | |

### guidance_sessions
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| module_id | uuid FK | Optional link |
| title_hi | text | |
| duration_minutes | int | |
| steps_json | jsonb | Ordered facilitation steps |

Full SQL: `supabase/schema.sql`
