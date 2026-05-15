# Solo Leveling Hunter Tracker

A Solo Leveling–themed full-stack workout tracker. Track exercises, plan a weekly schedule, log meals, monitor weight, and complete your daily quest.

## Stack

- **Frontend:** React 18 + Vite + React Router
- **Backend:** Express (Node.js, ES modules) with JSON file storage
- **Storage:** `server/data/db.json` (auto-created on first run)

## Features

- **Dashboard** — daily status overview (quest progress, today's plan, calories, weight)
- **Daily Quest** — checklist that auto-resets each day (defaults to the classic 100 push-ups / sit-ups / squats / 10 km run)
- **Exercises** — manage your exercise library
- **Schedule** — weekly plan with per-day focus and assigned exercises
- **Meals** — log meals by type, calories, and protein
- **Weight** — track body weight over time with a trend chart

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

Arise.
