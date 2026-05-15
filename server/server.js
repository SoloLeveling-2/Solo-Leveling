import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

const DEFAULT_EXERCISES = [
  {
    id: randomUUID(),
    name: 'Push-ups',
    muscleGroup: 'Chest',
    sets: 3,
    reps: 10,
    notes: 'Daily quest staple',
    videoUrl: '',
    imageUrl: '',
    youtubeQuery: 'how to do a push up proper form beginner',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulder-width.',
      'Keep your body in a straight line from head to heels.',
      'Lower your chest until it nearly touches the ground.',
      'Push back up to the starting position, exhaling as you rise.'
    ],
    tips: [
      'Engage your core throughout the movement',
      'Do not let your hips sag or pike up',
      'Drop to your knees if a full push-up is too hard',
      'Quality over quantity — slow controlled reps beat fast sloppy ones'
    ]
  },
  {
    id: randomUUID(),
    name: 'Sit-ups',
    muscleGroup: 'Core',
    sets: 3,
    reps: 10,
    notes: 'Daily quest staple',
    videoUrl: '',
    imageUrl: '',
    youtubeQuery: 'how to do a sit up proper form beginner',
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Place your hands lightly behind your ears or crossed on your chest.',
      'Engage your core and lift your torso toward your knees.',
      'Lower your back to the floor with control, then repeat.'
    ],
    tips: [
      'Do not pull on your neck — let your core do the work',
      'Exhale on the way up, inhale on the way down',
      'Try crunches as an easier alternative',
      'Plant your feet or have someone hold them if needed'
    ]
  },
  {
    id: randomUUID(),
    name: 'Squats',
    muscleGroup: 'Legs',
    sets: 3,
    reps: 10,
    notes: 'Daily quest staple',
    videoUrl: '',
    imageUrl: '',
    youtubeQuery: 'how to do a bodyweight squat proper form beginner',
    instructions: [
      'Stand with feet shoulder-width apart, toes slightly turned out.',
      'Lower your hips back and down as if sitting in a chair.',
      'Keep your chest up and your back straight.',
      'Descend until your thighs are roughly parallel to the floor.',
      'Push through your heels to stand back up.'
    ],
    tips: [
      'Knees should track over your toes, not collapse inward',
      'Keep your weight in your heels and midfoot',
      'Hold onto a doorframe or chair for balance if needed',
      'Box squats (squat down to a chair) are great for beginners'
    ]
  },
  {
    id: randomUUID(),
    name: 'Run',
    muscleGroup: 'Cardio',
    sets: 1,
    reps: 1,
    notes: 'Daily quest staple — 10 km goal',
    videoUrl: '',
    imageUrl: '',
    youtubeQuery: 'beginner running form tips couch to 5k',
    instructions: [
      'Warm up with a 5 minute brisk walk.',
      'Begin with a slow, comfortable jog. You should be able to talk.',
      'Land softly on your midfoot, not your heel.',
      'Keep an upright posture with relaxed shoulders.',
      'Cool down with a 5 minute walk and stretching.'
    ],
    tips: [
      'Start with walk/run intervals — 1 min run, 2 min walk',
      'Increase distance by no more than 10% per week',
      'Invest in proper running shoes',
      'Listen to your body — rest days are essential'
    ]
  }
];

const DIFFICULTY_PRESETS = {
  Beginner: [
    { text: '10 Push-ups', difficulty: 'Beginner' },
    { text: '10 Sit-ups', difficulty: 'Beginner' },
    { text: '10 Squats', difficulty: 'Beginner' },
    { text: '1 km Walk/Jog', difficulty: 'Beginner' }
  ],
  Intermediate: [
    { text: '50 Push-ups', difficulty: 'Intermediate' },
    { text: '50 Sit-ups', difficulty: 'Intermediate' },
    { text: '50 Squats', difficulty: 'Intermediate' },
    { text: '5 km Run', difficulty: 'Intermediate' }
  ],
  Advanced: [
    { text: '100 Push-ups', difficulty: 'Advanced' },
    { text: '100 Sit-ups', difficulty: 'Advanced' },
    { text: '100 Squats', difficulty: 'Advanced' },
    { text: '10 km Run', difficulty: 'Advanced' }
  ]
};

const DEFAULTS = {
  exercises: DEFAULT_EXERCISES,
  schedule: {
    Monday: { focus: 'Push Day', exerciseIds: [] },
    Tuesday: { focus: 'Pull Day', exerciseIds: [] },
    Wednesday: { focus: 'Leg Day', exerciseIds: [] },
    Thursday: { focus: 'Cardio', exerciseIds: [] },
    Friday: { focus: 'Upper Body', exerciseIds: [] },
    Saturday: { focus: 'Full Body', exerciseIds: [] },
    Sunday: { focus: 'Rest / Mobility', exerciseIds: [] }
  },
  meals: [],
  weights: [],
  checklist: DIFFICULTY_PRESETS.Beginner.map((p) => ({
    id: randomUUID(),
    text: p.text,
    difficulty: p.difficulty,
    done: false
  })),
  checklistDate: new Date().toISOString().slice(0, 10),
  difficulty: 'Beginner',
  completedDays: []
};

async function readDb() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeDb(DEFAULTS);
      return DEFAULTS;
    }
    throw err;
  }
}

async function writeDb(db) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2));
}

async function mutate(fn) {
  const db = await readDb();
  const result = await fn(db);
  await writeDb(db);
  return result;
}

function rollChecklistIfNewDay(db) {
  const today = new Date().toISOString().slice(0, 10);
  if (db.checklistDate !== today) {
    db.checklist = db.checklist.map((item) => ({ ...item, done: false }));
    db.checklistDate = today;
    return true;
  }
  return false;
}

function recordCompletionIfFinished(db) {
  if (db.checklist.length === 0) return false;
  const allDone = db.checklist.every((item) => item.done);
  if (allDone && !db.completedDays.includes(db.checklistDate)) {
    db.completedDays = [...db.completedDays, db.checklistDate].sort();
    return true;
  }
  return false;
}

function computeStats(db) {
  const days = [...db.completedDays].sort();
  const totalCompleted = days.length;

  let currentStreak = 0;
  if (days.length > 0) {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const last = days[days.length - 1];

    if (last === today || last === yesterday) {
      currentStreak = 1;
      for (let i = days.length - 2; i >= 0; i--) {
        const prev = new Date(days[i + 1]);
        prev.setDate(prev.getDate() - 1);
        const expected = prev.toISOString().slice(0, 10);
        if (days[i] === expected) currentStreak++;
        else break;
      }
    }
  }

  const ranks = [
    { name: 'E-Rank Hunter', min: 0, max: 0 },
    { name: 'D-Rank Hunter', min: 1, max: 3 },
    { name: 'C-Rank Hunter', min: 4, max: 7 },
    { name: 'B-Rank Hunter', min: 8, max: 14 },
    { name: 'A-Rank Hunter', min: 15, max: 30 },
    { name: 'S-Rank Hunter', min: 31, max: 60 },
    { name: 'National Level Hunter', min: 61, max: 100 },
    { name: 'Monarch', min: 101, max: Infinity }
  ];
  const rank = ranks.find((r) => totalCompleted >= r.min && totalCompleted <= r.max) || ranks[0];
  const rankIndex = ranks.indexOf(rank);
  const nextRank = ranks[rankIndex + 1];
  const progressToNext = nextRank
    ? Math.min(100, ((totalCompleted - rank.min) / (nextRank.min - rank.min)) * 100)
    : 100;

  const xp = totalCompleted * 100;
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const xpForCurrent = ((level - 1) ** 2) * 50;
  const xpForNext = (level ** 2) * 50;
  const xpProgress = ((xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100;

  return {
    rank: rank.name,
    nextRank: nextRank?.name || null,
    progressToNext,
    daysToNextRank: nextRank ? Math.max(0, nextRank.min - totalCompleted) : 0,
    currentStreak,
    totalCompleted,
    xp,
    level,
    xpForCurrent,
    xpForNext,
    xpProgress
  };
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// --- Exercises ---
app.get('/api/exercises', async (_req, res) => {
  const db = await readDb();
  res.json(db.exercises);
});

app.post('/api/exercises', async (req, res) => {
  const { name, muscleGroup, sets, reps, notes, videoUrl, imageUrl, instructions, tips, youtubeQuery } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const exercise = {
    id: randomUUID(),
    name,
    muscleGroup: muscleGroup || '',
    sets: Number(sets) || 0,
    reps: Number(reps) || 0,
    notes: notes || '',
    videoUrl: videoUrl || '',
    imageUrl: imageUrl || '',
    youtubeQuery: youtubeQuery || '',
    instructions: Array.isArray(instructions) ? instructions : (instructions ? [instructions] : []),
    tips: Array.isArray(tips) ? tips : (tips ? [tips] : [])
  };
  await mutate((db) => db.exercises.push(exercise));
  res.status(201).json(exercise);
});

app.put('/api/exercises/:id', async (req, res) => {
  const { id } = req.params;
  const updated = await mutate((db) => {
    const idx = db.exercises.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    db.exercises[idx] = { ...db.exercises[idx], ...req.body, id };
    return db.exercises[idx];
  });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/exercises/:id', async (req, res) => {
  const { id } = req.params;
  await mutate((db) => {
    db.exercises = db.exercises.filter((e) => e.id !== id);
    for (const day of Object.keys(db.schedule)) {
      db.schedule[day].exerciseIds = db.schedule[day].exerciseIds.filter((eid) => eid !== id);
    }
  });
  res.status(204).end();
});

// --- Schedule ---
app.get('/api/schedule', async (_req, res) => {
  const db = await readDb();
  res.json(db.schedule);
});

app.put('/api/schedule/:day', async (req, res) => {
  const { day } = req.params;
  const { focus, exerciseIds } = req.body;
  const updated = await mutate((db) => {
    if (!db.schedule[day]) return null;
    if (typeof focus === 'string') db.schedule[day].focus = focus;
    if (Array.isArray(exerciseIds)) db.schedule[day].exerciseIds = exerciseIds;
    return db.schedule[day];
  });
  if (!updated) return res.status(404).json({ error: 'Day not found' });
  res.json(updated);
});

// --- Meals ---
app.get('/api/meals', async (_req, res) => {
  const db = await readDb();
  res.json(db.meals);
});

app.post('/api/meals', async (req, res) => {
  const { name, calories, protein, date, type } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const meal = {
    id: randomUUID(),
    name,
    calories: Number(calories) || 0,
    protein: Number(protein) || 0,
    date: date || new Date().toISOString().slice(0, 10),
    type: type || 'Meal'
  };
  await mutate((db) => db.meals.unshift(meal));
  res.status(201).json(meal);
});

app.delete('/api/meals/:id', async (req, res) => {
  const { id } = req.params;
  await mutate((db) => {
    db.meals = db.meals.filter((m) => m.id !== id);
  });
  res.status(204).end();
});

// --- Weight ---
app.get('/api/weights', async (_req, res) => {
  const db = await readDb();
  res.json([...db.weights].sort((a, b) => a.date.localeCompare(b.date)));
});

app.post('/api/weights', async (req, res) => {
  const { weight, date } = req.body;
  if (weight === undefined || weight === null) return res.status(400).json({ error: 'Weight required' });
  const entry = {
    id: randomUUID(),
    weight: Number(weight),
    date: date || new Date().toISOString().slice(0, 10)
  };
  await mutate((db) => db.weights.push(entry));
  res.status(201).json(entry);
});

app.delete('/api/weights/:id', async (req, res) => {
  const { id } = req.params;
  await mutate((db) => {
    db.weights = db.weights.filter((w) => w.id !== id);
  });
  res.status(204).end();
});

// --- Checklist ---
app.get('/api/checklist', async (_req, res) => {
  const db = await readDb();
  const rolled = rollChecklistIfNewDay(db);
  if (rolled) await writeDb(db);
  res.json({
    items: db.checklist,
    date: db.checklistDate,
    difficulty: db.difficulty,
    completedDays: db.completedDays
  });
});

app.post('/api/checklist', async (req, res) => {
  const { text, difficulty } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  const item = { id: randomUUID(), text, done: false, difficulty: difficulty || 'Custom' };
  await mutate((db) => db.checklist.push(item));
  res.status(201).json(item);
});

app.put('/api/checklist/:id', async (req, res) => {
  const { id } = req.params;
  let completionRecorded = false;
  const updated = await mutate((db) => {
    const item = db.checklist.find((c) => c.id === id);
    if (!item) return null;
    if (typeof req.body.done === 'boolean') item.done = req.body.done;
    if (typeof req.body.text === 'string') item.text = req.body.text;
    completionRecorded = recordCompletionIfFinished(db);
    return item;
  });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json({ ...updated, completionRecorded });
});

app.delete('/api/checklist/:id', async (req, res) => {
  const { id } = req.params;
  await mutate((db) => {
    db.checklist = db.checklist.filter((c) => c.id !== id);
  });
  res.status(204).end();
});

app.post('/api/checklist/preset', async (req, res) => {
  const { difficulty } = req.body;
  if (!DIFFICULTY_PRESETS[difficulty]) {
    return res.status(400).json({ error: 'Invalid difficulty' });
  }
  await mutate((db) => {
    db.difficulty = difficulty;
    db.checklist = DIFFICULTY_PRESETS[difficulty].map((p) => ({
      id: randomUUID(),
      text: p.text,
      difficulty: p.difficulty,
      done: false
    }));
  });
  const db = await readDb();
  res.json({ items: db.checklist, difficulty: db.difficulty });
});

// --- Stats ---
app.get('/api/stats', async (_req, res) => {
  const db = await readDb();
  res.json(computeStats(db));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[System] Hunter Tracker server awakened on port ${PORT}`);
});
