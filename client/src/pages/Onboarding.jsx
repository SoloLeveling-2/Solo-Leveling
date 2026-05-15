import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useToast } from '../contexts/ToastContext.jsx';

const GOALS = [
  { id: 'general_fitness', label: 'Get Moving', desc: 'Build a daily exercise habit', icon: '✦' },
  { id: 'lose_weight', label: 'Lose Weight', desc: 'Reduce body weight gradually', icon: '◐' },
  { id: 'build_muscle', label: 'Build Muscle', desc: 'Gain strength and size', icon: '◈' },
  { id: 'endurance', label: 'Endurance', desc: 'Run longer, last longer', icon: '◎' }
];

const DIFFICULTIES = [
  {
    id: 'Beginner',
    title: 'Beginner',
    desc: 'Brand new or returning. 10 reps + 1 km walk/jog.',
    recommended: 'Start here if you have not exercised in a while.'
  },
  {
    id: 'Intermediate',
    title: 'Intermediate',
    desc: 'You can do 20+ push-ups already. 50 reps + 5 km run.',
    recommended: 'Pick this if you have been training a few months.'
  },
  {
    id: 'Advanced',
    title: 'Advanced',
    desc: 'The full Solo Leveling challenge. 100 reps + 10 km run.',
    recommended: 'For experienced trainees — this is no joke.'
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('general_fitness');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [startWeight, setStartWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = async () => {
    await api.put('/profile', {
      name: name.trim() || 'Hunter',
      goal,
      age: age ? Number(age) : null,
      height: height ? Number(height) : null,
      startWeight: startWeight ? Number(startWeight) : null,
      goalWeight: goalWeight ? Number(goalWeight) : null,
      onboarded: true
    });
    await api.post('/checklist/preset', { difficulty });
    if (startWeight) {
      await api.post('/weights', { weight: Number(startWeight) });
    }
    toast(`Welcome, ${name.trim() || 'Hunter'}. The system has registered you.`, {
      type: 'achievement',
      title: '[ Awakened ]',
      duration: 6000
    });
    navigate('/');
  };

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card">
        <div className="onboarding-progress">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`onboarding-dot${i <= step ? ' active' : ''}`} />
          ))}
        </div>

        {step === 0 && (
          <>
            <p className="hero-greeting">[ System Activation ]</p>
            <h2 className="onboarding-title">A new hunter has awakened.</h2>
            <p className="muted" style={{ marginBottom: 20 }}>
              The System has detected potential. Before you begin your ascent, let us register you.
              This wizard takes 30 seconds.
            </p>
            <label className="form-label">What should we call you?</label>
            <input
              autoFocus
              placeholder="Hunter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ fontSize: 16 }}
            />
            <div className="onboarding-actions">
              <span />
              <button className="primary" onClick={next}>Continue →</button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p className="hero-greeting">[ Step 2 of 4 ]</p>
            <h2 className="onboarding-title">What is your goal?</h2>
            <p className="muted" style={{ marginBottom: 20 }}>
              We will tailor encouragement and stats to match. You can change this later.
            </p>
            <div className="goal-grid">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`goal-card${goal === g.id ? ' selected' : ''}`}
                  onClick={() => setGoal(g.id)}
                >
                  <span className="goal-icon">{g.icon}</span>
                  <span className="goal-title">{g.label}</span>
                  <span className="goal-desc">{g.desc}</span>
                </button>
              ))}
            </div>
            <div className="onboarding-actions">
              <button className="ghost" onClick={back}>← Back</button>
              <button className="primary" onClick={next}>Continue →</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="hero-greeting">[ Step 3 of 4 ]</p>
            <h2 className="onboarding-title">Choose your starting difficulty.</h2>
            <p className="muted" style={{ marginBottom: 20 }}>
              Honesty here is critical, hunter. You can always level up later.
              <strong style={{ color: 'var(--success)' }}> Beginner</strong> is recommended for most.
            </p>
            <div className="diff-grid">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`diff-card${difficulty === d.id ? ' selected' : ''}`}
                  onClick={() => setDifficulty(d.id)}
                >
                  <span className="diff-card-title">{d.title}</span>
                  <span className="diff-card-desc">{d.desc}</span>
                  <span className="diff-card-rec">{d.recommended}</span>
                </button>
              ))}
            </div>
            <div className="onboarding-actions">
              <button className="ghost" onClick={back}>← Back</button>
              <button className="primary" onClick={next}>Continue →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="hero-greeting">[ Step 4 of 4 ]</p>
            <h2 className="onboarding-title">Optional body metrics.</h2>
            <p className="muted" style={{ marginBottom: 20 }}>
              Help us track progress. You can skip any of these and fill them in later.
            </p>
            <div className="metric-grid">
              <div>
                <label className="form-label">Age</label>
                <input type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Height (cm)</label>
                <input type="number" placeholder="175" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Current weight (kg)</label>
                <input type="number" step="0.1" placeholder="70" value={startWeight} onChange={(e) => setStartWeight(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Goal weight (kg)</label>
                <input type="number" step="0.1" placeholder="65" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} />
              </div>
            </div>
            <div className="onboarding-actions">
              <button className="ghost" onClick={back}>← Back</button>
              <button className="primary" onClick={finish}>Begin Training</button>
            </div>
          </>
        )}
      </div>

      <div className="onboarding-tip">
        💡 <span>Beginner tip: consistency &gt; intensity. 10 minutes daily beats 2 hours once a week.</span>
      </div>
    </div>
  );
}
