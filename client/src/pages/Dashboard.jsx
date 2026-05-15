import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function muscleClass(group) {
  if (!group) return '';
  const g = group.toLowerCase();
  if (g.includes('chest')) return 'chest';
  if (g.includes('core') || g.includes('abs')) return 'core';
  if (g.includes('leg')) return 'legs';
  if (g.includes('cardio') || g.includes('run')) return 'cardio';
  return '';
}

export default function Dashboard() {
  const [checklist, setChecklist] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [weights, setWeights] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [meals, setMeals] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/checklist'),
      api.get('/exercises'),
      api.get('/weights'),
      api.get('/schedule'),
      api.get('/meals'),
      api.get('/stats')
    ]).then(([cl, ex, w, sc, ml, st]) => {
      setChecklist(cl.items);
      setExercises(ex);
      setWeights(w);
      setSchedule(sc);
      setMeals(ml);
      setStats(st);
    });
  }, []);

  const today = DAYS[new Date().getDay()];
  const todayPlan = schedule[today];
  const todayExercises = todayPlan
    ? exercises.filter((e) => todayPlan.exerciseIds.includes(e.id))
    : [];

  const completed = checklist.filter((c) => c.done).length;
  const total = checklist.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const latestWeight = weights[weights.length - 1];

  const todayDate = new Date().toISOString().slice(0, 10);
  const todayMeals = meals.filter((m) => m.date === todayDate);
  const todayCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const todayProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0);

  const hour = new Date().getHours();
  const greeting = hour < 6 ? 'Hunter, the dungeon never sleeps'
    : hour < 12 ? 'Good morning, hunter'
    : hour < 18 ? 'Hunter, the system is watching'
    : 'Hunter, the night calls';

  return (
    <div>
      <div className="hero">
        <div className="hero-top">
          <div>
            <p className="hero-greeting">[ Status Window ]</p>
            <h1 className="hero-title">{greeting}</h1>
            <p className="muted" style={{ marginTop: 6 }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              {' · '}
              <span className="streak-flame">
                <span className="flame">🔥</span>
                <strong>{stats?.currentStreak ?? 0}</strong>
                <span className="faint">day streak</span>
              </span>
            </p>
          </div>
          {stats && (
            <div className="hero-rank-badge">
              <span className="rank-label">Hunter Rank</span>
              <span className="rank-value">{stats.rank}</span>
              <span className="faint" style={{ fontSize: 11, marginTop: 4 }}>
                LV {stats.level} · {stats.xp} XP
              </span>
            </div>
          )}
        </div>

        {stats && (
          <div className="hero-bars">
            <div className="bar-block">
              <div className="bar-label">
                <span>Today's Quest</span>
                <strong>{completed}/{total}</strong>
              </div>
              <div className="progress">
                <div className="progress-fill success" style={{ width: `${pct}%` }} />
              </div>
              <p className="faint" style={{ fontSize: 11, marginTop: 6 }}>
                {pct}% complete · <Link to="/quest" style={{ color: 'var(--accent-strong)' }}>Open quest log →</Link>
              </p>
            </div>
            <div className="bar-block">
              <div className="bar-label">
                <span>Progress to {stats.nextRank || 'Final Form'}</span>
                <strong>{Math.round(stats.progressToNext)}%</strong>
              </div>
              <div className="progress">
                <div className="progress-fill purple" style={{ width: `${stats.progressToNext}%` }} />
              </div>
              <p className="faint" style={{ fontSize: 11, marginTop: 6 }}>
                {stats.nextRank
                  ? `${stats.daysToNextRank} more completed quest day${stats.daysToNextRank === 1 ? '' : 's'} to ${stats.nextRank}`
                  : 'You have reached the highest rank.'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid cols-4">
        <div className="panel stat">
          <span className="stat-label">Streak</span>
          <span className="stat-value gold">{stats?.currentStreak ?? 0}🔥</span>
          <span className="stat-sub">consecutive days</span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Total Quests Cleared</span>
          <span className="stat-value purple">{stats?.totalCompleted ?? 0}</span>
          <span className="stat-sub">all-time completions</span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Current Weight</span>
          <span className="stat-value">{latestWeight ? `${latestWeight.weight}` : '—'}</span>
          <span className="stat-sub">{latestWeight ? `kg · ${latestWeight.date}` : 'no entries yet'}</span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Today's Intake</span>
          <span className="stat-value success">{todayCalories}</span>
          <span className="stat-sub">kcal · {todayProtein}g protein</span>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 22 }}>
        <h3 className="panel-title">Quick Actions</h3>
        <div className="quick-actions">
          <Link to="/quest" className="quick-action">
            <div className="quick-action-icon">✦</div>
            <div className="quick-action-body">
              <span className="quick-action-title">Start Daily Quest</span>
              <span className="quick-action-sub">{completed}/{total} cleared today</span>
            </div>
          </Link>
          <Link to="/meals" className="quick-action">
            <div className="quick-action-icon">◍</div>
            <div className="quick-action-body">
              <span className="quick-action-title">Log a Meal</span>
              <span className="quick-action-sub">{todayMeals.length} logged today</span>
            </div>
          </Link>
          <Link to="/weight" className="quick-action">
            <div className="quick-action-icon">◎</div>
            <div className="quick-action-body">
              <span className="quick-action-title">Log Weight</span>
              <span className="quick-action-sub">{latestWeight ? `${latestWeight.weight} kg` : 'no entries'}</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 22 }}>
        <div className="flex-between">
          <h3 className="panel-title">Today · {today} · {todayPlan?.focus || 'Rest'}</h3>
          <Link to="/schedule"><button className="ghost tiny">Edit Schedule</button></Link>
        </div>
        {todayExercises.length === 0 ? (
          <p className="empty">No exercises scheduled. Visit the Schedule page to plan today.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Group</th>
                <th>Sets</th>
                <th>Reps</th>
              </tr>
            </thead>
            <tbody>
              {todayExercises.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td><span className={`tag ${muscleClass(e.muscleGroup)}`}>{e.muscleGroup || '—'}</span></td>
                  <td>{e.sets}</td>
                  <td>{e.reps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel" style={{ marginTop: 22 }}>
        <div className="flex-between">
          <h3 className="panel-title">Daily Quest Preview</h3>
          <Link to="/quest"><button className="ghost tiny">Open Quest Log</button></Link>
        </div>
        {checklist.length === 0 ? (
          <p className="empty">No quest items yet.</p>
        ) : (
          <ul className="checklist">
            {checklist.slice(0, 4).map((item) => (
              <li key={item.id} className={`quest-card${item.done ? ' done' : ''}`}>
                <div className="quest-row">
                  <span className={`checkbox${item.done ? ' done' : ''}`}>{item.done ? '✓' : ''}</span>
                  <span className="quest-text">{item.text}</span>
                  {item.difficulty && (
                    <span className={`quest-difficulty-tag ${item.difficulty.toLowerCase()}`}>{item.difficulty}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
