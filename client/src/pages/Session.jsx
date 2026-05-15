import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { useConfirm } from '../contexts/ConfirmContext.jsx';
import ExerciseMedia from '../components/ExerciseMedia.jsx';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function Session() {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  const [exercises, setExercises] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [started, setStarted] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [setsDone, setSetsDone] = useState({});
  const [restSeconds, setRestSeconds] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const tickRef = useRef(null);

  const today = DAYS[new Date().getDay()];

  useEffect(() => {
    Promise.all([api.get('/exercises'), api.get('/schedule')]).then(([exs, sch]) => {
      setExercises(exs);
      setSchedule(sch);
    });
  }, []);

  useEffect(() => {
    if (!started) return;
    tickRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
      setRestSeconds((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [started, startedAt]);

  useEffect(() => {
    if (restSeconds === 0 && restTotal > 0) {
      toast('Rest complete. Next set!', { type: 'success', duration: 3000 });
      setRestTotal(0);
    }
  }, [restSeconds, restTotal, toast]);

  if (!schedule) return <p className="muted">Loading…</p>;

  const todayPlan = schedule[today];
  const planExercises = exercises.filter((e) => todayPlan?.exerciseIds.includes(e.id));

  const start = () => {
    if (planExercises.length === 0) {
      toast('No exercises scheduled for today. Assign some on the Schedule page first.', { type: 'error' });
      return;
    }
    setStarted(true);
    setStartedAt(Date.now());
    setElapsed(0);
    setCurrentIdx(0);
    setSetsDone({});
  };

  const cancel = async () => {
    const ok = await confirm({
      title: 'End session?',
      message: 'This will discard the current session without saving.',
      confirmText: 'Discard',
      danger: true
    });
    if (!ok) return;
    setStarted(false);
    setSetsDone({});
    setRestSeconds(0);
    setRestTotal(0);
    setElapsed(0);
  };

  const finish = async () => {
    const payload = {
      focus: todayPlan.focus,
      startTime: new Date(startedAt).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: elapsed,
      exercises: planExercises.map((e) => ({
        exerciseId: e.id,
        name: e.name,
        setsCompleted: setsDone[e.id] || 0,
        targetSets: e.sets,
        reps: e.reps
      }))
    };
    await api.post('/sessions', payload);
    toast(`Session saved · ${formatTime(elapsed)} of work.`, {
      type: 'achievement',
      title: '[ Mission Complete ]',
      duration: 5000
    });
    setStarted(false);
    setTimeout(() => navigate('/progress'), 600);
  };

  const incrementSet = (exId, target) => {
    setSetsDone((prev) => {
      const next = { ...prev, [exId]: Math.min(target, (prev[exId] || 0) + 1) };
      const ex = planExercises.find((e) => e.id === exId);
      const isLastSet = next[exId] >= target;
      if (!isLastSet) {
        setRestSeconds(60);
        setRestTotal(60);
      }
      if (isLastSet && ex && currentIdx < planExercises.length - 1) {
        setTimeout(() => setCurrentIdx((i) => Math.min(planExercises.length - 1, i + 1)), 600);
      }
      return next;
    });
  };

  const decrementSet = (exId) => {
    setSetsDone((prev) => ({ ...prev, [exId]: Math.max(0, (prev[exId] || 0) - 1) }));
  };

  const totalSets = planExercises.reduce((s, e) => s + (e.sets || 1), 0);
  const completedSets = planExercises.reduce((s, e) => s + (setsDone[e.id] || 0), 0);
  const overallPct = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;
  const allDone = totalSets > 0 && completedSets >= totalSets;

  if (!started) {
    return (
      <div>
        <h1 className="page-title">[ ACTIVE SESSION ]</h1>
        <p className="page-sub">Interactive workout mode. Start when you are ready, hunter.</p>

        <div className="panel panel-glow">
          <h3 className="panel-title">Today · {today} · {todayPlan?.focus || 'Rest day'}</h3>
          {planExercises.length === 0 ? (
            <>
              <p className="empty">No exercises scheduled for today.</p>
              <button className="primary" onClick={() => navigate('/schedule')}>Plan Schedule →</button>
            </>
          ) : (
            <>
              <p className="muted" style={{ marginBottom: 16 }}>
                You will be guided through {planExercises.length} exercise{planExercises.length === 1 ? '' : 's'} · about{' '}
                {totalSets} sets total. The system will time your rest between sets.
              </p>
              <ul className="session-preview">
                {planExercises.map((e) => (
                  <li key={e.id}>
                    <strong>{e.name}</strong> <span className="muted">{e.sets} sets × {e.reps} reps</span>
                  </li>
                ))}
              </ul>
              <button className="primary" style={{ marginTop: 18, padding: '14px 28px', fontSize: 14 }} onClick={start}>
                ▶ Start Session
              </button>
            </>
          )}
        </div>

        <div className="panel" style={{ marginTop: 22 }}>
          <h3 className="panel-title">Beginner Tips</h3>
          <ul style={{ paddingLeft: 18, lineHeight: 1.6, color: 'var(--text-dim)' }}>
            <li>Warm up first — 5 minutes of light cardio or dynamic stretches</li>
            <li>Use the videos on each exercise to check your form</li>
            <li>Take the full 60 second rest between sets — it is not optional</li>
            <li>If a set feels easy, that is fine. Quality beats intensity for beginners.</li>
            <li>Cool down with light stretching after</li>
          </ul>
        </div>
      </div>
    );
  }

  const currentEx = planExercises[currentIdx];
  const currentSetsDone = setsDone[currentEx.id] || 0;
  const currentDone = currentSetsDone >= currentEx.sets;

  return (
    <div>
      <div className="session-header">
        <div>
          <p className="hero-greeting">[ Session Active ]</p>
          <h1 className="page-title" style={{ margin: 0 }}>{todayPlan.focus}</h1>
        </div>
        <div className="session-timer">
          <div className="faint" style={{ fontSize: 10, letterSpacing: 3 }}>ELAPSED</div>
          <div className="session-timer-value">{formatTime(elapsed)}</div>
        </div>
      </div>

      <div className="progress" style={{ margin: '12px 0 20px' }}>
        <div className="progress-fill purple" style={{ width: `${overallPct}%` }} />
      </div>
      <p className="faint" style={{ fontSize: 12, marginBottom: 18 }}>
        {completedSets} / {totalSets} sets complete · {overallPct}%
      </p>

      <div className="panel panel-glow">
        <div className="flex-between">
          <h3 className="panel-title">Exercise {currentIdx + 1} of {planExercises.length}</h3>
          <span className="muted">{currentEx.muscleGroup || '—'}</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 2, color: 'var(--accent-strong)', margin: '0 0 12px' }}>
          {currentEx.name}
        </h2>

        <div className="session-grid">
          <ExerciseMedia exercise={currentEx} compact />
          <div>
            <div className="session-rep-info">
              <div>
                <div className="faint" style={{ fontSize: 10, letterSpacing: 2 }}>TARGET</div>
                <div className="session-rep-value">{currentEx.sets} × {currentEx.reps}</div>
              </div>
              <div>
                <div className="faint" style={{ fontSize: 10, letterSpacing: 2 }}>SETS DONE</div>
                <div className="session-rep-value">{currentSetsDone} / {currentEx.sets}</div>
              </div>
            </div>

            {restSeconds > 0 && (
              <div className="rest-banner">
                <div className="faint" style={{ fontSize: 10, letterSpacing: 2 }}>REST</div>
                <div className="rest-time">{restSeconds}s</div>
                <button className="ghost tiny" onClick={() => { setRestSeconds(0); setRestTotal(0); }}>Skip Rest</button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <button className="primary" onClick={() => incrementSet(currentEx.id, currentEx.sets)} disabled={currentDone}>
                {currentDone ? '✓ All Sets Done' : '+ Complete Set'}
              </button>
              <button className="ghost" onClick={() => decrementSet(currentEx.id)}>− Undo Set</button>
              {currentEx.tips?.length > 0 && (
                <details style={{ marginTop: 6, width: '100%' }}>
                  <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: 2, color: 'var(--accent-strong)', textTransform: 'uppercase' }}>
                    Form tips ({currentEx.tips.length})
                  </summary>
                  <ul style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8, paddingLeft: 18 }}>
                    {currentEx.tips.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </details>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 22 }}>
        <h3 className="panel-title">All Exercises</h3>
        <div className="session-list">
          {planExercises.map((e, i) => {
            const sd = setsDone[e.id] || 0;
            const done = sd >= e.sets;
            return (
              <button
                key={e.id}
                type="button"
                className={`session-list-item${i === currentIdx ? ' current' : ''}${done ? ' done' : ''}`}
                onClick={() => setCurrentIdx(i)}
              >
                <span className="session-list-marker">{done ? '✓' : i + 1}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{e.name}</span>
                <span className="muted" style={{ fontSize: 12 }}>{sd}/{e.sets}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <button className="ghost" onClick={cancel}>Cancel Session</button>
        <button className="primary" onClick={finish} style={{ padding: '14px 28px' }}>
          {allDone ? '✓ Finish & Save' : 'Finish Early'}
        </button>
      </div>
    </div>
  );
}
