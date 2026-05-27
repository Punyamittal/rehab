# REHAB Learning Platform — System Architecture

## Overview

A modular, emotionally safe digital learning platform for rehabilitation centres serving underaged girls. Technology augments human facilitators—it does not replace them.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Next.js PWA)                      │
│  Student App │ Facilitator Dashboard │ Volunteer Guide │ Offline  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     API Layer (Next.js Route Handlers)           │
│  Auth │ Modules │ Stories │ Emotions │ Progress │ Analytics       │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              Supabase (PostgreSQL + Auth + Storage)              │
│  RLS policies │ Realtime (optional) │ Edge Functions (future)    │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    External Services (Future)                      │
│  Gemini/OpenAI (story gen) │ TTS (Hindi narration) │ Analytics     │
└─────────────────────────────────────────────────────────────────┘
```

## Module Boundaries

| Module | Responsibility | Key Entities |
|--------|----------------|--------------|
| **Authentication** | Role-based access (student, facilitator, volunteer, admin) | users, sessions |
| **Student Profiles** | Pseudonymous profiles, centre assignment | students, centres |
| **Learning Engine** | Micro-modules, checkpoints, rewards | modules, lessons, progress |
| **Story Engine** | Branching narratives, choices, outcomes | stories, nodes, choices |
| **Emotion Tracking** | Pre/post check-ins, trends | emotion_logs |
| **Facilitator Dashboard** | Attendance, progress, notes, reports | attendance, facilitator_notes |
| **Volunteer Guidance** | Session scripts, prompts, timing | guidance_sessions |
| **Analytics** | Aggregated engagement, emotion trends | materialized views |
| **Offline Support** | Service worker, IndexedDB cache | cached_modules |
| **Narration System** | TTS, audio playback, subtitles | narration_tracks |

## Folder Structure

```
rehab-platform/
├── docs/                    # Architecture, roadmap, wireframes
├── supabase/                # SQL schema, migrations
├── public/                  # Static assets, ambient loops
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Login flows
│   │   ├── (student)/       # Student learning experience
│   │   ├── (facilitator)/   # Dashboard
│   │   ├── (volunteer)/     # Guided facilitation
│   │   └── api/             # REST/route handlers
│   ├── components/
│   │   ├── ui/              # Buttons, cards, modals
│   │   ├── learning/        # Module player, quizzes
│   │   ├── story/           # Branching story engine
│   │   ├── emotion/         # Check-in widgets
│   │   ├── ambient/         # Motion backgrounds
│   │   ├── dashboard/       # Facilitator components
│   │   └── volunteer/       # Guidance flows
│   ├── lib/
│   │   ├── supabase/        # Client, server, middleware
│   │   ├── i18n/            # Hindi/English strings
│   │   ├── offline/         # Cache utilities
│   │   └── hooks/           # Shared React hooks
│   ├── stores/              # Zustand state
│   ├── types/               # TypeScript definitions
│   └── data/                # Seed modules & stories (MVP)
```

## API Design

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/session` | GET | Current user + role |
| `/api/students` | GET/POST | List/create students |
| `/api/modules` | GET | List modules (filter by topic) |
| `/api/modules/[id]/progress` | POST | Save checkpoint/completion |
| `/api/stories/[id]` | GET | Story graph for engine |
| `/api/emotions` | POST | Log check-in |
| `/api/emotions/trends` | GET | Aggregated trends (facilitator) |
| `/api/attendance` | POST | Mark attendance |
| `/api/facilitator/notes` | POST | Session notes |
| `/api/guidance/[sessionId]` | GET | Volunteer script steps |

## Security Model

- **Row Level Security (RLS)** on all Supabase tables
- Students see only their own progress and emotions
- Facilitators see students in their assigned centre
- Pseudonymous student IDs (no PII in MVP demo)
- Hindi-first UI with optional English toggle

## Offline Strategy (MVP → Full)

1. **MVP**: Static module JSON bundled; progress queued in localStorage
2. **Phase 2**: Service Worker + IndexedDB for module assets
3. **Phase 3**: Background sync when connectivity returns

## Design Tokens

- Warm gradients: peach → lavender → soft mint
- Large touch targets (min 48px)
- Rounded corners (16–24px)
- Soft shadows, no harsh contrasts
- Framer Motion: gentle fades, no rapid flashing

## Wireframe Concepts

See `docs/WIREFRAMES.md` for screen-by-screen layouts.

## Scalability Notes

- Module content stored as JSON schema (versioned)
- Story engine is graph-based (nodes + edges)
- Facilitator dashboard uses pagination + date filters
- Future: multi-centre org hierarchy, AI story generation pipeline
