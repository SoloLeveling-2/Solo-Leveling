import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TRAINING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const REST_DAYS = ['Saturday', 'Sunday'];
const REST_FOCUS = { Saturday: 'Rest / Mobility', Sunday: 'Full Rest' };
const TODAY_JS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

function muscleClass(group) {
  if (!group) return '';
  const g = group.toLowerCase();
  if (g.includes('chest')) return 'chest';
  if (g.includes('core') || g.includes('abs')) return 'core';
  if (g.includes('leg')) return 'legs';
  if (g.includes('cardio') || g.includes('run')) return 'cardio';
  return '';
}

function ExerciseChip({ exercise, assigned, onToggle }) {
  return (
    <button
      type="button"
      className={`assignment-pill${assigned ? ' selected' : ''}`}
      onClick={onToggle}
      aria-pressed={assigned}
    >
      <span>{assigned ? '✓' : '+'}</span>
      {exercise.name}
    </button>
  );
}

function AssignedExercise({ exercise, onRemove }) {
  return (
    <div className="assigned-exercise-card">
      <div>
        <strong>{exercise.name}</strong>
        <div className="assigned-meta">
          <span className={`tag ${muscleClass(exercise.muscleGroup)}`}>{exercise.muscleGroup || 'General'}</span>
          <span>{exercise.sets || 0} sets</span>
          <span>{exercise.reps || 0} reps</span>
        </div>
      </div>
      <button type="button" className="tiny ghost" onClick={onRemove} aria-label={`Remove ${exercise.name}`}>Remove</button>
    </div>
  );
}

export default function Schedule() {
  const [schedule, setSchedule] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [activeDay, setActiveDay] = useState(TODAY_JS);

  const load = async () => {
    const [sch, exs] = await Promise.all([api.get('/schedule'), api.get('/exercises')]);
    setSchedule(sch);
    setExercises(exs);
    const initial = {};
    for (const d of DAYS) initial[d] = sch[d]?.focus ?? '';
    setDrafts(initial);
    if (!sch[activeDay]) setActiveDay('Monday');
  };

  useEffect(() => { load(); }, []);

  const saveFocus = async (day) => {
    await api.put(`/schedule/${day}`, { focus: drafts[day] || REST_FOCUS[day] || '' });
    load();
  };

  const setRestDayDefaults = async () => {
    await Promise.all([
      api.put('/schedule/Saturday', { focus: 'Rest / Mobility', exerciseIds: [] }),
      api.put('/schedule/Sunday', { focus: 'Full Rest', exerciseIds: [] })
    ]);
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

  const exerciseMap = useMemo(() => Object.fromEntries(exercises.map((exercise) => [exercise.id, exercise])), [exercises]);

  if (!schedule) return <p className="muted">Loading…</p>;

  const weekendHasExercises = REST_DAYS.some((day) => (schedule[day]?.exerciseIds || []).length > 0);
  const weekendRestReady = REST_DAYS.every((day) => (schedule[day]?.focus || '') === REST_FOCUS[day] && (schedule[day]?.exerciseIds || []).length === 0);
  const activePlan = schedule[activeDay];
  const activeExercises = (activePlan?.exerciseIds || []).map((id) => exerciseMap[id]).filter(Boolean);

  const renderDayCard = (day, rest = false) => {
    const plan = schedule[day];
    const displayFocus = rest ? (plan.focus || REST_FOCUS[day]) : plan.focus;
    const dayExs = (plan.exerciseIds || []).map((id) => exerciseMap[id]).filter(Boolean);
    const isToday = day === TODAY_JS;
    const isActive = day === activeDay;

    return (
      <article key={day} className={`schedule-day-card${isToday ? ' today' : ''}${isActive ? ' active' : ''}${rest ? ' rest' : ''}`}>
        <button type="button" className="schedule-day-select" onClick={() => setActiveDay(day)}>
          <span className="schedule-day-name">{day}</span>
          {isToday && <span className="today-badge">Today</span>}
          {rest && <span className="rest-badge">Rest</span>}
        </button>
        <input
          className="focus-input"
          placeholder={rest ? 'Rest focus' : 'Training focus'}
          value={drafts[day] || displayFocus}
          onChange={(e) => setDrafts({ ...drafts, [day]: e.target.value })}
          onBlur={() => saveFocus(day)}
        />
        <div className="schedule-chip-row">
          {dayExs.length === 0 ? (
            <span className="empty">{rest ? 'Recovery day — no exercises assigned' : 'No exercises assigned'}</span>
          ) : (
            dayExs.map((exercise) => (
              <span key={exercise.id} className={`tag ${muscleClass(exercise.muscleGroup)}`}>
                {exercise.name} · {exercise.sets || 0}×{exercise.reps || 0}
              </span>
            ))
          )}
        </div>
      </article>
    );
  };

  return (
    <div>
      <div className="schedule-hero">
        <div>
          <h1 className="page-title">[ WEEKLY SCHEDULE ]</h1>
          <p className="page-sub">Plan Monday–Friday training while protecting recovery on the weekend.</p>
        </div>
        <button type="button" className="primary weekend-rest-button" onClick={setRestDayDefaults}>
          Set weekends as rest days
          {weekendRestReady && <span>Active</span>}
          {weekendHasExercises && <span>Clears weekend assignments</span>}
        </button>
      </div>

      <div className="schedule-layout">
        <section className="schedule-board">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Active cycle</p>
              <h3 className="panel-title">Training Days</h3>
            </div>
            <span className="muted">Monday through Friday</span>
          </div>
          <div className="schedule-day-grid training">
            {TRAINING_DAYS.map((day) => renderDayCard(day))}
          </div>

          <div className="section-heading rest-heading">
            <div>
              <p className="eyebrow">Recovery protocol</p>
              <h3 className="panel-title">Rest Days</h3>
            </div>
            <span className="muted">Saturday mobility, Sunday full rest</span>
          </div>
          <div className="schedule-day-grid rest-days">
            {REST_DAYS.map((day) => renderDayCard(day, true))}
          </div>
        </section>

        <aside className="panel assignment-panel">
          <div className="assignment-header">
            <div>
              <p className="eyebrow">Assignment panel</p>
              <h3>{activeDay}</h3>
              <span className="muted">{activePlan.focus || (REST_DAYS.includes(activeDay) ? REST_FOCUS[activeDay] : 'Training')}</span>
            </div>
            {activeDay === TODAY_JS && <span className="today-badge large">Today</span>}
          </div>

          <div className="assignment-section">
            <h4>Assigned Exercises</h4>
            {activeExercises.length === 0 ? (
              <p className="empty">{REST_DAYS.includes(activeDay) ? 'Rest day is clear. Add mobility only if you need it.' : 'Choose exercises below to build this day.'}</p>
            ) : (
              <div className="assigned-list">
                {activeExercises.map((exercise) => (
                  <AssignedExercise
                    key={exercise.id}
                    exercise={exercise}
                    onRemove={() => toggleExercise(activeDay, exercise.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="assignment-section">
            <h4>Assign Exercises</h4>
            <div className="assignment-pill-grid">
              {exercises.length === 0 && <span className="empty">Add exercises first</span>}
              {exercises.map((exercise) => (
                <ExerciseChip
                  key={exercise.id}
                  exercise={exercise}
                  assigned={(activePlan.exerciseIds || []).includes(exercise.id)}
                  onToggle={() => toggleExercise(activeDay, exercise.id)}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
