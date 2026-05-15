import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import ExerciseMedia from '../components/ExerciseMedia.jsx';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

function matchExercise(text, exercises) {
  if (!text || !exercises.length) return null;
  const lower = text.toLowerCase();
  return exercises.find((e) => lower.includes(e.name.toLowerCase()))
    || exercises.find((e) => {
      const key = e.name.toLowerCase().replace(/-/g, '');
      return lower.replace(/-/g, '').includes(key);
    })
    || null;
}

export default function Checklist() {
  const [items, setItems] = useState([]);
  const [date, setDate] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [text, setText] = useState('');
  const [exercises, setExercises] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [justCompleted, setJustCompleted] = useState(false);
  const [completedDays, setCompletedDays] = useState([]);

  const loadAll = async () => {
    const [cl, exs] = await Promise.all([api.get('/checklist'), api.get('/exercises')]);
    setItems(cl.items);
    setDate(cl.date);
    setDifficulty(cl.difficulty || 'Beginner');
    setCompletedDays(cl.completedDays || []);
    setExercises(exs);
  };

  useEffect(() => { loadAll(); }, []);

  const toggle = async (item) => {
    const result = await api.put(`/checklist/${item.id}`, { done: !item.done });
    if (result.completionRecorded) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 6000);
    }
    loadAll();
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await api.post('/checklist', { text: text.trim(), difficulty: 'Custom' });
    setText('');
    loadAll();
  };

  const remove = async (id) => {
    await api.del(`/checklist/${id}`);
    loadAll();
  };

  const switchDifficulty = async (level) => {
    if (level === difficulty) return;
    const replaceCurrent = items.length === 0 ||
      window.confirm(`Replace current quest list with ${level} preset?\nThis will reset today's progress on these items.`);
    if (!replaceCurrent) return;
    await api.post('/checklist/preset', { difficulty: level });
    setExpanded({});
    loadAll();
  };

  const toggleExpand = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  const completed = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const completedToday = completedDays.includes(date);

  const enriched = useMemo(
    () => items.map((item) => ({ ...item, exercise: matchExercise(item.text, exercises) })),
    [items, exercises]
  );

  return (
    <div>
      <h1 className="page-title">[ DAILY QUEST ]</h1>
      <p className="page-sub">Complete every objective before the day resets. The system rewards consistency.</p>

      <div className="panel panel-glow">
        <div className="flex-between">
          <h3 className="panel-title">Difficulty</h3>
          <span className="muted" style={{ fontSize: 13 }}>Today: <strong>{date}</strong></span>
        </div>
        <div className="difficulty-tabs">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              className={`diff-tab${difficulty === d ? ' active' : ''}`}
              onClick={() => switchDifficulty(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <p className="faint" style={{ fontSize: 13, margin: 0 }}>
          {difficulty === 'Beginner' && '✦ Light intro — perfect if you are just starting out (10 reps + 1 km walk/jog).'}
          {difficulty === 'Intermediate' && '✦ Mid-tier hunter — 50 reps + 5 km run.'}
          {difficulty === 'Advanced' && '✦ The original Solo Leveling challenge — 100 reps + 10 km run.'}
        </p>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="flex-between">
          <h3 className="panel-title">Progress · {completed}/{total}</h3>
          <span className="muted">{pct}%{completedToday ? ' · Cleared!' : ''}</span>
        </div>
        <div className="progress" style={{ marginBottom: 20 }}>
          <div className={`progress-fill${pct === 100 ? ' success' : ''}`} style={{ width: `${pct}%` }} />
        </div>

        {items.length === 0 ? (
          <p className="empty">No objectives yet. Switch to a difficulty preset or add custom objectives below.</p>
        ) : (
          <ul className="checklist">
            {enriched.map((item) => {
              const isOpen = !!expanded[item.id];
              const ex = item.exercise;
              return (
                <li key={item.id} className={`quest-card${item.done ? ' done' : ''}`}>
                  <div className="quest-row">
                    <button
                      className={`checkbox${item.done ? ' done' : ''}`}
                      onClick={() => toggle(item)}
                      aria-label={item.done ? 'Mark incomplete' : 'Mark complete'}
                      type="button"
                    >
                      {item.done ? '✓' : ''}
                    </button>
                    <span className="quest-text">{item.text}</span>
                    {item.difficulty && (
                      <span className={`quest-difficulty-tag ${item.difficulty.toLowerCase()}`}>{item.difficulty}</span>
                    )}
                    {ex && (
                      <button className="ghost tiny" onClick={() => toggleExpand(item.id)} type="button">
                        {isOpen ? 'Hide' : 'How to'}
                      </button>
                    )}
                    <button className="danger tiny" onClick={() => remove(item.id)} type="button">Remove</button>
                  </div>

                  {isOpen && ex && (
                    <div className="quest-expand">
                      <div className="quest-expand-grid">
                        <div>
                          <h5>Step-by-Step</h5>
                          {ex.instructions?.length ? (
                            <ol>
                              {ex.instructions.map((line, i) => <li key={i}>{line}</li>)}
                            </ol>
                          ) : (
                            <p className="tip">No instructions yet. Add some on the Exercises page.</p>
                          )}
                          {ex.tips?.length > 0 && (
                            <>
                              <h5 style={{ marginTop: 12 }}>Form Tips</h5>
                              <ul>
                                {ex.tips.map((tip, i) => <li key={i} className="tip">{tip}</li>)}
                              </ul>
                            </>
                          )}
                        </div>
                        <div>
                          <h5>Visual Demo</h5>
                          <ExerciseMedia exercise={ex} compact />
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <form className="row" onSubmit={addItem} style={{ marginTop: 20, marginBottom: 0 }}>
          <input
            placeholder="Add a custom objective (e.g. 5 min plank)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="primary">Add Objective</button>
        </form>
      </div>

      {justCompleted && (
        <div className="system-banner">
          <span className="banner-icon">⚔️</span>
          <div>
            <h3>[ Quest Complete ]</h3>
            <p>You have grown stronger, hunter. Your streak continues — the system marks this day.</p>
          </div>
        </div>
      )}

      {pct === 100 && total > 0 && !justCompleted && (
        <div className="system-banner">
          <span className="banner-icon">✨</span>
          <div>
            <h3>[ All Objectives Cleared ]</h3>
            <p>Rest, hunter. Tomorrow the dungeon resets.</p>
          </div>
        </div>
      )}
    </div>
  );
}
