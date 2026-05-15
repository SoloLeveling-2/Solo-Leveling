import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

const DEFAULTS = {
  exercises: [
    { id: randomUUID(), name: 'Push-ups', muscleGroup: 'Chest', sets: 10, reps: 10, notes: 'Daily quest' },
    { id: randomUUID(), name: 'Sit-ups', muscleGroup: 'Core', sets: 10, reps: 10, notes: 'Daily quest' },
    { id: randomUUID(), name: 'Squats', muscleGroup: 'Legs', sets: 10, reps: 10, notes: 'Daily quest' },
    { id: randomUUID(), name: 'Run', muscleGroup: 'Cardio', sets: 1, reps: 1, notes: '10 km daily quest' }
  ],
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
  checklist: [
    { id: randomUUID(), text: '100 Push-ups', done: false },
    { id: randomUUID(), text: '100 Sit-ups', done: false },
    { id: randomUUID(), text: '100 Squats', done: false },
    { id: randomUUID(), text: '10 km Run', done: false }
  ],
  checklistDate: new Date().toISOString().slice(0, 10)
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

const app = express();
app.use(cors());
app.use(express.json());

// --- Exercises ---
app.get('/api/exercises', async (_req, res) => {
  const db = await readDb();
  res.json(db.exercises);
});

app.post('/api/exercises', async (req, res) => {
  const { name, muscleGroup, sets, reps, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const exercise = {
    id: randomUUID(),
    name,
    muscleGroup: muscleGroup || '',
    sets: Number(sets) || 0,
    reps: Number(reps) || 0,
    notes: notes || ''
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
  res.json({ items: db.checklist, date: db.checklistDate });
});

app.post('/api/checklist', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  const item = { id: randomUUID(), text, done: false };
  await mutate((db) => db.checklist.push(item));
  res.status(201).json(item);
});

app.put('/api/checklist/:id', async (req, res) => {
  const { id } = req.params;
  const updated = await mutate((db) => {
    const item = db.checklist.find((c) => c.id === id);
    if (!item) return null;
    if (typeof req.body.done === 'boolean') item.done = req.body.done;
    if (typeof req.body.text === 'string') item.text = req.body.text;
    return item;
  });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/checklist/:id', async (req, res) => {
  const { id } = req.params;
  await mutate((db) => {
    db.checklist = db.checklist.filter((c) => c.id !== id);
  });
  res.status(204).end();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[System] Hunter Tracker server awakened on port ${PORT}`);
});
