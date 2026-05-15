# Solo Leveling Hunter Tracker

A Solo Leveling–themed full-stack workout tracker. Onboard as a brand-new hunter, complete daily quests, run timed workout sessions, unlock achievements, and climb the ranks from E to Monarch.

## Stack

- **Frontend:** React 18 + Vite + React Router
- **Backend:** Express (Node.js, ES modules) with JSON file storage
- **Storage:** `server/data/db.json` (auto-created on first run)

## Features

### Pages

- **Onboarding** — first-run wizard: name, goal, difficulty, optional body metrics
- **Dashboard** — rank seal, level + XP bar, streak, stat radar (STR/END/DIS), today's mission, quick actions, beginner tips
- **Daily Quest** — checklist with **Beginner / Intermediate / Advanced** presets, expandable "How to" with embedded YouTube video, step-by-step instructions, and form tips
- **Active Session** — guided workout flow with timer, per-set tracking, automatic 60 s rest timer, in-context form tips & video
- **Exercises** — card-based library with video/image embeds, multi-line instructions and form tips
- **Schedule** — weekly plan with per-day focus and assigned exercises (today is highlighted)
- **Progress** — heatmap of last 90 days, rank seal, stat radar, weight trend chart, streak records
- **Achievements** — 17 unlockable medals across Bronze/Silver/Gold/Legendary tiers
- **Meals** — log meals by type, calories, and protein
- **Weight** — track body weight over time with a trend chart
- **Profile** — edit hunter identity & metrics; danger-zone reset

### Systems

- **8-tier rank system** — E → D → C → B → A → S → National → Monarch, with custom SVG rank seals
- **Stat profile** — Strength, Endurance, Discipline computed from your activity, displayed as a radar chart
- **Streak tracking** — current + best-ever streaks; rank progression based on completed quest days
- **17 achievements** — unlock medals for streaks, totals, sessions, meals logged, ranks reached
- **Active workout sessions** — interactive timer with rest breaks, set counters, and post-session analytics
- **YouTube + image embeds** — paste any YouTube URL/ID or image URL on any exercise; renders inline everywhere
- **Toast + modal system** — non-blocking confirmations & system notifications

### Beginner-friendly

- Onboarding wizard auto-loads the Beginner preset (10 reps + 1 km walk/jog)
- Each exercise ships with multi-line beginner instructions and form tips
- Daily rotating beginner tip card on the dashboard (until you have 7 completed quests)
- "Watch on YouTube" search shortcut for any exercise that doesn't have a video set yet
- Glossary tooltips on stats (STR/END/DIS)
- Session preview panel with warm-up & cool-down guidance

## Setup

```bash
npm install
npm install --prefix server
npm install --prefix client
```

Or all at once:

```bash
npm run install:all
```

## Run (dev)

Runs the Express API on `:4000` and Vite dev server on `:5173` with `/api` proxied.

```bash
npm run dev
```

Open <http://localhost:5173>.

## Build (production)

```bash
npm run build           # builds the client
npm start               # starts the API server
```

## Project Layout

```
.
├── client/         # React + Vite frontend
│   └── src/
│       ├── pages/        # Dashboard, Checklist, Session, Exercises, Schedule,
│       │                 # Progress, Achievements, Meals, Weight, Profile, Onboarding
│       ├── components/   # RankSeal, StatRadar, HeatmapCalendar, ExerciseMedia, Tooltip
│       ├── contexts/     # ToastContext, ConfirmContext
│       ├── lib/          # media URL helpers
│       ├── api/          # fetch wrapper
│       ├── App.jsx
│       └── main.jsx
├── server/         # Express backend
│   ├── server.js
│   └── data/db.json      # gitignored, auto-created
└── package.json    # root scripts (concurrently runs both)
```

## API

| Method | Path                       | Purpose                                                |
|--------|----------------------------|--------------------------------------------------------|
| GET    | `/api/profile`             | get hunter profile                                     |
| PUT    | `/api/profile`             | update profile (incl. onboarded flag)                  |
| GET    | `/api/exercises`           | list exercises                                         |
| POST   | `/api/exercises`           | create exercise                                        |
| PUT    | `/api/exercises/:id`       | update exercise                                        |
| DELETE | `/api/exercises/:id`       | delete exercise                                        |
| GET    | `/api/schedule`            | get weekly schedule                                    |
| PUT    | `/api/schedule/:day`       | update a day's focus / exercises                       |
| GET    | `/api/meals`               | list meals                                             |
| POST   | `/api/meals`               | log a meal                                             |
| DELETE | `/api/meals/:id`           | delete a meal                                          |
| GET    | `/api/weights`             | list weight entries (sorted)                           |
| POST   | `/api/weights`             | log weight                                             |
| DELETE | `/api/weights/:id`         | delete entry                                           |
| GET    | `/api/checklist`           | get today's quest items                                |
| POST   | `/api/checklist`           | add quest item                                         |
| PUT    | `/api/checklist/:id`       | toggle / edit quest item                               |
| DELETE | `/api/checklist/:id`       | remove quest item                                      |
| POST   | `/api/checklist/preset`    | switch difficulty preset (Beginner/Intermediate/Adv.)  |
| GET    | `/api/sessions`            | list workout sessions                                  |
| POST   | `/api/sessions`            | save a workout session                                 |
| DELETE | `/api/sessions/:id`        | delete a session                                       |
| GET    | `/api/stats`               | rank, level, XP, streak, stat radar, achievement count |
| GET    | `/api/achievements`        | all achievement defs with unlock status                |
| GET    | `/api/history`             | quest history, last-90-day completion calendar         |
| POST   | `/api/reset`               | wipe all data and reseed defaults                      |

## Adding videos & images

On the **Exercises** page, edit any exercise and paste:

- a **YouTube URL** (`https://www.youtube.com/watch?v=...`, `https://youtu.be/...`, or just the 11-character video ID)
- an **image URL** (any direct image link)

These appear in the exercise card, in the Daily Quest "How to" view, and inside the Active Session panel.

If you haven't set a video yet, each exercise has a one-click "Watch on YouTube" button that opens a tutorial search for that movement.

Arise.
