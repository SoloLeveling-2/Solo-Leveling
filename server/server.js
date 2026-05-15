import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data', 'db.json');

const DEFAULT_EXERCISES = [
  {
    id: 'push-ups',
    name: 'Push-ups',
    muscleGroup: 'Chest',
    sets: 3,
    reps: 10,
    notes: 'Daily quest staple',
    beginnerExplanation: 'A bodyweight chest, shoulder, and triceps exercise. Keep the movement slow and controlled; knee push-ups are a valid starting point.',
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
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
    ],
    category: 'strength'
  },
  {
    id: 'sit-ups',
    name: 'Sit-ups',
    muscleGroup: 'Core',
    sets: 3,
    reps: 10,
    notes: 'Daily quest staple',
    beginnerExplanation: 'A core exercise that trains trunk flexion. Move from your abs instead of pulling your head or neck.',
    videoUrl: 'https://www.youtube.com/watch?v=1fbU_MkV7NE',
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
    ],
    category: 'strength'
  },
  {
    id: 'squats',
    name: 'Squats',
    muscleGroup: 'Legs',
    sets: 3,
    reps: 10,
    notes: 'Daily quest staple',
    beginnerExplanation: 'A foundational lower-body pattern for quads, glutes, and balance. Use a chair target until depth feels safe and repeatable.',
    videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U',
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
    ],
    category: 'strength'
  },
  {
    id: 'run',
    name: 'Run',
    muscleGroup: 'Cardio',
    sets: 1,
    reps: 1,
    notes: 'Daily quest staple — 10 km goal',
    beginnerExplanation: 'Cardio work that should begin conversational and easy. Walking intervals count while your joints and lungs adapt.',
    videoUrl: 'https://www.youtube.com/watch?v=brFHyOtTwH4',
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
    ],
    category: 'cardio'
  }
];

const DIFFICULTY_PRESETS = {
  Beginner: [
    { text: '10 Push-ups', difficulty: 'Beginner', category: 'strength' },
    { text: '10 Sit-ups', difficulty: 'Beginner', category: 'strength' },
    { text: '10 Squats', difficulty: 'Beginner', category: 'strength' },
    { text: '1 km Walk/Jog', difficulty: 'Beginner', category: 'cardio' }
  ],
  Intermediate: [
    { text: '50 Push-ups', difficulty: 'Intermediate', category: 'strength' },
    { text: '50 Sit-ups', difficulty: 'Intermediate', category: 'strength' },
    { text: '50 Squats', difficulty: 'Intermediate', category: 'strength' },
    { text: '5 km Run', difficulty: 'Intermediate', category: 'cardio' }
  ],
  Advanced: [
    { text: '100 Push-ups', difficulty: 'Advanced', category: 'strength' },
    { text: '100 Sit-ups', difficulty: 'Advanced', category: 'strength' },
    { text: '100 Squats', difficulty: 'Advanced', category: 'strength' },
    { text: '10 km Run', difficulty: 'Advanced', category: 'cardio' }
  ]
};

const DEFAULT_PROFILE = {
  name: '',
  height: null,
  startWeight: null,
  goalWeight: null,
  targetRank: 'S-Rank Hunter',
  age: null,
  units: 'metric',
  onboarded: false,
  goal: 'general_fitness',
  createdAt: new Date().toISOString()
};

const ACHIEVEMENT_DEFS = [
  { id: 'first_quest', name: 'First Steps', desc: 'Complete your very first daily quest', icon: '🌱', tier: 'bronze', check: (s) => s.completedDays >= 1 },
  { id: 'streak_3', name: 'Momentum', desc: 'Maintain a 3-day streak', icon: '⚡', tier: 'bronze', check: (s) => s.currentStreak >= 3 || s.bestStreak >= 3 },
  { id: 'streak_7', name: 'Week-Long Hunter', desc: 'Maintain a 7-day streak', icon: '🔥', tier: 'silver', check: (s) => s.currentStreak >= 7 || s.bestStreak >= 7 },
  { id: 'streak_30', name: 'Iron Discipline', desc: 'Maintain a 30-day streak', icon: '⚔️', tier: 'gold', check: (s) => s.currentStreak >= 30 || s.bestStreak >= 30 },
  { id: 'streak_100', name: 'Unbreakable', desc: 'Maintain a 100-day streak', icon: '🏆', tier: 'legendary', check: (s) => s.currentStreak >= 100 || s.bestStreak >= 100 },
  { id: 'quests_10', name: 'Apprentice Hunter', desc: 'Complete 10 daily quests', icon: '✦', tier: 'bronze', check: (s) => s.completedDays >= 10 },
  { id: 'quests_30', name: 'Devoted', desc: 'Complete 30 daily quests', icon: '✨', tier: 'silver', check: (s) => s.completedDays >= 30 },
  { id: 'quests_100', name: 'Centurion', desc: 'Complete 100 daily quests', icon: '⚜️', tier: 'gold', check: (s) => s.completedDays >= 100 },
  { id: 'rank_s', name: 'S-Rank Hunter', desc: 'Reach the S-Rank', icon: '👑', tier: 'gold', check: (s) => s.completedDays >= 31 },
  { id: 'rank_monarch', name: 'Monarch', desc: 'Reach the Monarch rank', icon: '🜲', tier: 'legendary', check: (s) => s.completedDays >= 101 },
  { id: 'meals_10', name: 'Nutritionist', desc: 'Log 10 meals', icon: '🥗', tier: 'bronze', check: (s) => s.totalMeals >= 10 },
  { id: 'meals_50', name: 'Master Chef', desc: 'Log 50 meals', icon: '🍳', tier: 'silver', check: (s) => s.totalMeals >= 50 },
  { id: 'weight_5', name: 'Body Awareness', desc: 'Log weight 5 times', icon: '⚖️', tier: 'bronze', check: (s) => s.totalWeights >= 5 },
  { id: 'weight_30', name: 'Steady Tracker', desc: 'Log weight 30 times', icon: '📊', tier: 'silver', check: (s) => s.totalWeights >= 30 },
  { id: 'arsenal_10', name: 'Arsenal Builder', desc: 'Create 10 exercises', icon: '🗡️', tier: 'silver', check: (s) => s.totalExercises >= 10 },
  { id: 'session_first', name: 'First Mission', desc: 'Complete your first workout session', icon: '🎯', tier: 'bronze', check: (s) => s.totalSessions >= 1 },
  { id: 'session_10', name: 'Mission Veteran', desc: 'Complete 10 workout sessions', icon: '🛡️', tier: 'silver', check: (s) => s.totalSessions >= 10 }
];

function clone(value) {
  return structuredClone(value);
}

function createDefaultChecklist() {
  return DIFFICULTY_PRESETS.Beginner.map((p) => ({
    id: randomUUID(),
    text: p.text,
    difficulty: p.difficulty,
    category: p.category,
    done: false
  }));
}

function createDefaultDb() {
  return {
    exercises: clone(DEFAULT_EXERCISES),
    schedule: {
      Monday: { focus: 'Push Day', exerciseIds: ['push-ups'] },
      Tuesday: { focus: 'Pull Day', exerciseIds: ['sit-ups'] },
      Wednesday: { focus: 'Leg Day', exerciseIds: ['squats'] },
      Thursday: { focus: 'Cardio', exerciseIds: ['run'] },
      Friday: { focus: 'Upper Body', exerciseIds: ['push-ups', 'sit-ups'] },
      Saturday: { focus: 'Rest / Mobility', exerciseIds: [] },
      Sunday: { focus: 'Full Rest', exerciseIds: [] }
    },
    meals: [],
    weights: [],
    checklist: createDefaultChecklist(),
    checklistDate: new Date().toISOString().slice(0, 10),
    difficulty: 'Beginner',
    completedDays: [],
    profile: { ...DEFAULT_PROFILE, createdAt: new Date().toISOString() },
    sessions: [],
    questHistory: []
  };
}

function mergeDb(parsed = {}) {
  const defaults = createDefaultDb();
  const schedule = { ...defaults.schedule, ...(parsed.schedule || {}) };

  for (const day of Object.keys(schedule)) {
    schedule[day] = {
      ...(defaults.schedule[day] || { focus: day, exerciseIds: [] }),
      ...(schedule[day] || {})
    };
    if (!Array.isArray(schedule[day].exerciseIds)) schedule[day].exerciseIds = [];
  }

  const defaultExerciseById = Object.fromEntries(defaults.exercises.map((exercise) => [exercise.id, exercise]));
  const exercises = Array.isArray(parsed.exercises) ? parsed.exercises.map((exercise) => {
    const defaultExercise = defaultExerciseById[exercise.id];
    if (!defaultExercise) return exercise;
    return {
      ...exercise,
      videoUrl: exercise.videoUrl || defaultExercise.videoUrl,
      youtubeQuery: exercise.youtubeQuery || defaultExercise.youtubeQuery
    };
  }) : defaults.exercises;

  return {
    ...defaults,
    ...parsed,
    exercises,
    schedule,
    meals: Array.isArray(parsed.meals) ? parsed.meals : defaults.meals,
    weights: Array.isArray(parsed.weights) ? parsed.weights : defaults.weights,
    checklist: Array.isArray(parsed.checklist) ? parsed.checklist : defaults.checklist,
    completedDays: Array.isArray(parsed.completedDays) ? parsed.completedDays : defaults.completedDays,
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : defaults.sessions,
    questHistory: Array.isArray(parsed.questHistory) ? parsed.questHistory : defaults.questHistory,
    profile: { ...defaults.profile, ...(parsed.profile || {}) }
  };
}

async function readDb() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return mergeDb(JSON.parse(raw));
  } catch (err) {
    if (err.code === 'ENOENT') {
      const fresh = createDefaultDb();
      await writeDb(fresh);
      return fresh;
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
    db.questHistory = [...(db.questHistory || []), {
      date: db.checklistDate,
      difficulty: db.difficulty,
      items: db.checklist.map((i) => ({ text: i.text, category: i.category }))
    }];
    return true;
  }
  return false;
}

function computeStreak(days) {
  const sorted = [...days].sort();
  if (sorted.length === 0) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const last = sorted[sorted.length - 1];
  if (last !== today && last !== yesterday) return 0;
  let streak = 1;
  for (let i = sorted.length - 2; i >= 0; i--) {
    const prev = new Date(sorted[i + 1]);
    prev.setDate(prev.getDate() - 1);
    const expected = prev.toISOString().slice(0, 10);
    if (sorted[i] === expected) streak++;
    else break;
  }
  return streak;
}

function computeBestStreak(days) {
  const sorted = [...days].sort();
  if (sorted.length === 0) return 0;
  let best = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    prev.setDate(prev.getDate() + 1);
    if (prev.toISOString().slice(0, 10) === sorted[i]) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return best;
}

function computeStats(db) {
  const days = [...db.completedDays].sort();
  const totalCompleted = days.length;
  const currentStreak = computeStreak(days);
  const bestStreak = computeBestStreak(days);

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

  const xp = totalCompleted * 100 + (db.sessions?.length || 0) * 25;
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const xpForCurrent = ((level - 1) ** 2) * 50;
  const xpForNext = (level ** 2) * 50;
  const xpProgress = xpForNext > xpForCurrent
    ? ((xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100
    : 0;

  const history = db.questHistory || [];
  const strengthDays = history.filter((h) => h.items?.some((i) => i.category === 'strength')).length;
  const cardioDays = history.filter((h) => h.items?.some((i) => i.category === 'cardio')).length;

  const stats = {
    strength: Math.min(100, Math.round(strengthDays * 1.8 + (db.sessions?.length || 0) * 1.5)),
    endurance: Math.min(100, Math.round(cardioDays * 2.5 + (db.sessions?.length || 0) * 1)),
    discipline: Math.min(100, Math.round(currentStreak * 4 + totalCompleted * 0.6))
  };

  const baseStats = {
    rank: rank.name,
    rankIndex,
    nextRank: nextRank?.name || null,
    progressToNext,
    daysToNextRank: nextRank ? Math.max(0, nextRank.min - totalCompleted) : 0,
    currentStreak,
    bestStreak,
    totalCompleted,
    totalMeals: db.meals.length,
    totalWeights: db.weights.length,
    totalExercises: db.exercises.length,
    totalSessions: (db.sessions || []).length,
    xp,
    level,
    xpForCurrent,
    xpForNext,
    xpProgress,
    statBreakdown: stats
  };

  const unlocked = ACHIEVEMENT_DEFS.filter((a) => a.check(baseStats));
  baseStats.achievementsUnlocked = unlocked.length;
  baseStats.achievementsTotal = ACHIEVEMENT_DEFS.length;

  return baseStats;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// --- Profile ---
app.get('/api/profile', async (_req, res) => {
  const db = await readDb();
  res.json(db.profile);
});

app.put('/api/profile', async (req, res) => {
  const allowed = ['name', 'height', 'startWeight', 'goalWeight', 'targetRank', 'age', 'units', 'onboarded', 'goal'];
  const updated = await mutate((db) => {
    for (const key of allowed) {
      if (key in req.body) db.profile[key] = req.body[key];
    }
    return db.profile;
  });
  res.json(updated);
});

// --- Exercises ---
app.get('/api/exercises', async (_req, res) => {
  const db = await readDb();
  res.json(db.exercises);
});

app.post('/api/exercises', async (req, res) => {
  const { name, muscleGroup, sets, reps, notes, beginnerExplanation, videoUrl, imageUrl, instructions, tips, youtubeQuery, category } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const exercise = {
    id: randomUUID(),
    name,
    muscleGroup: muscleGroup || '',
    sets: Number(sets) || 0,
    reps: Number(reps) || 0,
    notes: notes || '',
    beginnerExplanation: beginnerExplanation || '',
    videoUrl: videoUrl || '',
    imageUrl: imageUrl || '',
    youtubeQuery: youtubeQuery || '',
    category: category || (muscleGroup && /cardio|run/i.test(muscleGroup) ? 'cardio' : 'strength'),
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
  const { text, difficulty, category } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  const item = {
    id: randomUUID(),
    text,
    done: false,
    difficulty: difficulty || 'Custom',
    category: category || 'strength'
  };
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
      category: p.category,
      done: false
    }));
  });
  const db = await readDb();
  res.json({ items: db.checklist, difficulty: db.difficulty });
});

// --- Workout Sessions ---
app.get('/api/sessions', async (_req, res) => {
  const db = await readDb();
  res.json([...(db.sessions || [])].sort((a, b) => (b.startTime || '').localeCompare(a.startTime || '')));
});

app.post('/api/sessions', async (req, res) => {
  const { exercises = [], focus = '', startTime, endTime, durationSeconds = 0, notes = '' } = req.body;
  const session = {
    id: randomUUID(),
    date: (startTime || new Date().toISOString()).slice(0, 10),
    focus,
    startTime: startTime || new Date().toISOString(),
    endTime: endTime || new Date().toISOString(),
    durationSeconds: Number(durationSeconds) || 0,
    exercises,
    notes
  };
  await mutate((db) => { db.sessions = [...(db.sessions || []), session]; });
  res.status(201).json(session);
});

app.delete('/api/sessions/:id', async (req, res) => {
  const { id } = req.params;
  await mutate((db) => {
    db.sessions = (db.sessions || []).filter((s) => s.id !== id);
  });
  res.status(204).end();
});

// --- Stats ---
app.get('/api/stats', async (_req, res) => {
  const db = await readDb();
  res.json(computeStats(db));
});

// --- Achievements ---
app.get('/api/achievements', async (_req, res) => {
  const db = await readDb();
  const stats = computeStats(db);
  const achievements = ACHIEVEMENT_DEFS.map((a) => ({
    id: a.id,
    name: a.name,
    desc: a.desc,
    icon: a.icon,
    tier: a.tier,
    unlocked: a.check(stats)
  }));
  res.json(achievements);
});

// --- History / Progress ---
app.get('/api/history', async (_req, res) => {
  const db = await readDb();
  const completedDays = [...db.completedDays].sort();
  const last90 = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    last90.push({ date: iso, completed: completedDays.includes(iso) });
  }
  res.json({
    completedDays,
    last90,
    questHistory: db.questHistory || [],
    weights: [...db.weights].sort((a, b) => a.date.localeCompare(b.date)),
    sessions: db.sessions || []
  });
});

// --- Reset (for testing) ---
app.post('/api/reset', async (_req, res) => {
  const fresh = createDefaultDb();
  await writeDb(fresh);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[System] Hunter Tracker server awakened on port ${PORT}`);
});
