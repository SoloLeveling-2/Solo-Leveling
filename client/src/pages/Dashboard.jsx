import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import RankSeal from '../components/RankSeal.jsx';
import StatRadar from '../components/StatRadar.jsx';
import Tooltip from '../components/Tooltip.jsx';

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

const BEGINNER_TIPS = [
  '✦ Consistency beats intensity. 10 daily minutes beats 2 hours once a week.',
  '✦ Warm up for 5 min before any workout — light cardio or dynamic stretches.',
  '✦ Form > reps. Slow and controlled wins every time.',
  '✦ Rest days are part of the program — your muscles grow when you rest.',
  '✦ Hydrate before, during, and after training.',
  '✦ Log every workout. Tracking progress is half the battle.',
  '✦ Sleep 7-9 hours. Recovery is when you actually get stronger.'
];

export default function Dashboard() {
  const [checklist, setChecklist] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [weights, setWeights] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [meals, setMeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/checklist'),
      api.get('/exercises'),
      api.get('/weights'),
      api.get('/schedule'),
      api.get('/meals'),
      api.get('/stats'),
      api.get('/profile')
    ]).then(([cl, ex, w, sc, ml, st, pr]) => {
      setChecklist(cl.items);
      setExercises(ex);
      setWeights(w);
      setSchedule(sc);
      setMeals(ml);
      setStats(st);
      setProfile(pr);
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
  const name = profile?.name || 'Hunter';
  const greeting = hour < 6 ? `The dungeon never sleeps, ${name}`
    : hour < 12 ? `Good morning, ${name}`
    : hour < 18 ? `${name}, the system is watching`
    : `Good evening, ${name}`;

  const tip = BEGINNER_TIPS[new Date().getDate() % BEGINNER_TIPS.length];
  const isBeginner = stats?.totalCompleted < 7;

  return (
    <div>
      <div className="hero">
        <div className="hero-top">
          <div className="hero-left">
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
            <div className="hero-rank-block">
              <RankSeal rank={stats.rank} size={88} />
              <div>
                <div className="rank-label">Hunter Rank</div>
                <div className="rank-value">{stats.rank}</div>
                <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>
                  LV {stats.level} · {stats.xp} XP
                </div>
              </div>
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
                  ? `${stats.daysToNextRank} more quest day${stats.daysToNextRank === 1 ? '' : 's'} to ${stats.nextRank}`
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
          <span className="stat-sub">Best: {stats?.bestStreak ?? 0} days</span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Quests Cleared</span>
          <span className="stat-value purple">{stats?.totalCompleted ?? 0}</span>
          <span className="stat-sub">all-time completions</span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Achievements</span>
          <span className="stat-value">{stats?.achievementsUnlocked ?? 0}/{stats?.achievementsTotal ?? 0}</span>
          <span className="stat-sub"><Link to="/achievements" style={{ color: 'var(--accent-strong)' }}>View badges →</Link></span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Today's Intake</span>
          <span className="stat-value success">{todayCalories}</span>
          <span className="stat-sub">kcal · {todayProtein}g protein</span>
        </div>
      </div>

      <div className="grid cols-2" style={{ marginTop: 22 }}>
        <div className="panel">
          <h3 className="panel-title">Quick Actions</h3>
          <div className="quick-actions-vert">
            <Link to="/session" className="quick-action quick-action-primary">
              <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, var(--purple), var(--accent))' }}>▶</div>
              <div className="quick-action-body">
                <span className="quick-action-title">Start Active Session</span>
                <span className="quick-action-sub">Guided workout with timer</span>
              </div>
            </Link>
            <Link to="/quest" className="quick-action">
              <div className="quick-action-icon">✦</div>
              <div className="quick-action-body">
                <span className="quick-action-title">Daily Quest</span>
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

        {stats && (
          <div className="panel">
            <h3 className="panel-title">Stat Profile</h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <StatRadar stats={stats.statBreakdown} size={220} />
            </div>
            <p className="faint" style={{ fontSize: 12, textAlign: 'center', marginTop: 4 }}>
              <Tooltip text="Earned from completing strength quests like push-ups, sit-ups, squats">
                <span style={{ color: 'var(--accent-strong)' }}>STR</span>
              </Tooltip>
              {' · '}
              <Tooltip text="Earned from cardio quests like running">
                <span style={{ color: 'var(--success)' }}>END</span>
              </Tooltip>
              {' · '}
              <Tooltip text="Built through consecutive days of completing the daily quest">
                <span style={{ color: 'var(--purple)' }}>DIS</span>
              </Tooltip>
            </p>
          </div>
        )}
      </div>

      {isBeginner && (
        <div className="panel panel-purple" style={{ marginTop: 22 }}>
          <h3 className="panel-title">📖 Beginner Tip</h3>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text)' }}>{tip}</p>
        </div>
      )}

      <div className="panel" style={{ marginTop: 22 }}>
        <div className="flex-between">
          <h3 className="panel-title">Today · {today} · {todayPlan?.focus || 'Rest'}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/session"><button className="primary tiny">Start Session →</button></Link>
            <Link to="/schedule"><button className="ghost tiny">Edit Schedule</button></Link>
          </div>
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
