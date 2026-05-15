import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Dashboard() {
  const [checklist, setChecklist] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [weights, setWeights] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/checklist'),
      api.get('/exercises'),
      api.get('/weights'),
      api.get('/schedule'),
      api.get('/meals')
    ]).then(([cl, ex, w, sc, ml]) => {
      setChecklist(cl.items);
      setExercises(ex);
      setWeights(w);
      setSchedule(sc);
      setMeals(ml);
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

  return (
    <div>
      <h1 className="page-title">[ STATUS ]</h1>
      <p className="page-sub">Hunter, your daily report awaits.</p>

      <div className="grid cols-3">
        <div className="panel stat">
          <span className="stat-label">Daily Quest</span>
          <span className="stat-value">{completed}/{total}</span>
          <div className="progress">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="stat-sub">{pct}% complete</span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Current Weight</span>
          <span className="stat-value">{latestWeight ? `${latestWeight.weight} kg` : '—'}</span>
          <span className="stat-sub">
            {latestWeight ? `Logged ${latestWeight.date}` : 'No entries yet'}
          </span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Today's Intake</span>
          <span className="stat-value">{todayCalories} kcal</span>
          <span className="stat-sub">{todayProtein}g protein · {todayMeals.length} meals</span>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="flex-between">
          <h3 className="panel-title">Today: {today} · {todayPlan?.focus || 'Rest'}</h3>
          <Link to="/schedule"><button className="ghost">Edit Schedule</button></Link>
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
                  <td><span className="tag">{e.muscleGroup || '—'}</span></td>
                  <td>{e.sets}</td>
                  <td>{e.reps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="flex-between">
          <h3 className="panel-title">Daily Quest Preview</h3>
          <Link to="/quest"><button className="ghost">Open Quest Log</button></Link>
        </div>
        {checklist.length === 0 ? (
          <p className="empty">No quest items yet.</p>
        ) : (
          <ul className="checklist">
            {checklist.slice(0, 4).map((item) => (
              <li key={item.id} className={`checklist-item${item.done ? ' done' : ''}`}>
                <span className={`checkbox${item.done ? ' done' : ''}`}>{item.done ? '✓' : ''}</span>
                <span className="text">{item.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
