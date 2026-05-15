import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TODAY_JS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

export default function Schedule() {
  const [schedule, setSchedule] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [drafts, setDrafts] = useState({});

  const load = async () => {
    const [sch, exs] = await Promise.all([api.get('/schedule'), api.get('/exercises')]);
    setSchedule(sch);
    setExercises(exs);
    const initial = {};
    for (const d of DAYS) initial[d] = sch[d]?.focus ?? '';
    setDrafts(initial);
  };

  useEffect(() => { load(); }, []);

  const saveFocus = async (day) => {
    await api.put(`/schedule/${day}`, { focus: drafts[day] });
    load();
  };

  const toggleExercise = async (day, exerciseId) => {
    const current = schedule[day].exerciseIds;
    const next = current.includes(exerciseId)
      ? current.filter((id) => id !== exerciseId)
      : [...current, exerciseId];
    await api.put(`/schedule/${day}`, { exerciseIds: next });
    load();
  };

  if (!schedule) return <p className="muted">Loading…</p>;

  return (
    <div>
      <h1 className="page-title">[ WEEKLY SCHEDULE ]</h1>
      <p className="page-sub">Plan your training cycle. Click a day to assign exercises and set a focus.</p>

      <div className="grid cols-3">
        {DAYS.map((day) => {
          const plan = schedule[day];
          const dayExs = exercises.filter((e) => plan.exerciseIds.includes(e.id));
          const isToday = day === TODAY_JS;
          return (
            <div key={day} className={`day-card${isToday ? ' today' : ''}`}>
              <h4>{day}{isToday && ' · TODAY'}</h4>
              <input
                className="focus-input"
                placeholder="Focus (e.g. Push Day)"
                value={drafts[day]}
                onChange={(e) => setDrafts({ ...drafts, [day]: e.target.value })}
                onBlur={() => saveFocus(day)}
              />
              <div>
                {dayExs.length === 0 ? (
                  <span className="empty">No exercises assigned</span>
                ) : (
                  <ul>
                    {dayExs.map((e) => (
                      <li key={e.id}>
                        {e.name} <span className="muted">· {e.sets}×{e.reps}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <details>
                <summary>Assign exercises ({exercises.length})</summary>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {exercises.length === 0 && <span className="empty">Add exercises first</span>}
                  {exercises.map((e) => (
                    <label key={e.id} className="toggle-row">
                      <input
                        type="checkbox"
                        checked={plan.exerciseIds.includes(e.id)}
                        onChange={() => toggleExercise(day, e.id)}
                      />
                      <span>{e.name} <span className="faint">· {e.muscleGroup || '—'}</span></span>
                    </label>
                  ))}
                </div>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}
