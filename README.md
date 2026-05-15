# Solo Leveling Hunter Tracker

A Solo Leveling–themed full-stack workout tracker. Track exercises, plan a weekly schedule, log meals, monitor weight, and complete your daily quest.

## Stack

- **Frontend:** React 18 + Vite + React Router
- **Backend:** Express (Node.js, ES modules) with JSON file storage
- **Storage:** `server/data/db.json` (auto-created on first run)

## Features

- **Dashboard** — Hunter Rank, level + XP, daily streak, today's mission with progress bars, quick actions
- **Daily Quest** — checklist with **Beginner / Intermediate / Advanced** difficulty presets, expandable "How to" view with embedded YouTube video, step-by-step instructions, and form tips for each exercise
- **Exercises** — card-based library with video/image embeds, multi-line instructions, and form tips per exercise
- **Schedule** — weekly plan with per-day focus and assigned exercises (today is highlighted)
- **Meals** — log meals by type, calories, and protein
- **Weight** — track body weight over time with a trend chart
- **Rank system** — completing your daily quest advances you from E-Rank through Monarch
- **Streak tracking** — consecutive days of cleared quests
- **YouTube + image embeds** — paste a YouTube URL/ID or image URL on any exercise and it'll render inline

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
│       ├── pages/      # Dashboard, Checklist, Exercises, Schedule, Meals, Weight
│       ├── api/        # fetch wrapper
│       ├── App.jsx
│       └── main.jsx
├── server/         # Express backend
│   ├── server.js
│   └── data/db.json    # gitignored, auto-created
└── package.json    # root scripts (concurrently runs both)
```

## API

| Method | Path                  | Purpose                          |
|--------|-----------------------|----------------------------------|
| GET    | `/api/exercises`      | list exercises                   |
| POST   | `/api/exercises`      | create exercise                  |
| PUT    | `/api/exercises/:id`  | update exercise                  |
| DELETE | `/api/exercises/:id`  | delete exercise                  |
| GET    | `/api/schedule`       | get weekly schedule              |
| PUT    | `/api/schedule/:day`  | update a day's focus / exercises |
| GET    | `/api/meals`          | list meals                       |
| POST   | `/api/meals`          | log a meal                       |
| DELETE | `/api/meals/:id`      | delete a meal                    |
| GET    | `/api/weights`        | list weight entries (sorted)     |
| POST   | `/api/weights`        | log weight                       |
| DELETE | `/api/weights/:id`    | delete entry                     |
| GET    | `/api/checklist`      | get today's quest items          |
| POST   | `/api/checklist`      | add quest item                   |
| PUT    | `/api/checklist/:id`  | toggle / edit quest item         |
| DELETE | `/api/checklist/:id`  | remove quest item                |
| POST   | `/api/checklist/preset` | switch difficulty preset (Beginner/Intermediate/Advanced) |
| GET    | `/api/stats`          | hunter rank, level, XP, streak   |

## Adding videos & images

On the **Exercises** page, edit any exercise and paste:

- a **YouTube URL** (`https://www.youtube.com/watch?v=...`, `https://youtu.be/...`, or just the 11-character video ID)
- an **image URL** (any direct image link)

These appear in the exercise card and inside the Daily Quest "How to" view.

If you haven't set a video yet, each exercise has a one-click "Watch on YouTube" button that opens a tutorial search for that movement.

Arise.
