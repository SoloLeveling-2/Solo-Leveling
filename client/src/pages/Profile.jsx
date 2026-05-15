import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { useConfirm } from '../contexts/ConfirmContext.jsx';
import RankSeal from '../components/RankSeal.jsx';

export default function Profile() {
  const toast = useToast();
  const confirm = useConfirm();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/profile').then(setProfile);
    api.get('/stats').then(setStats);
  }, []);

  const save = async () => {
    const updated = await api.put('/profile', profile);
    setProfile(updated);
    toast('Profile updated.', { type: 'success' });
  };

  const reset = async () => {
    const ok = await confirm({
      title: 'Reset all data?',
      message: 'This will wipe your profile, quests, exercises, meals, weights, sessions, and history. This cannot be undone.',
      confirmText: 'Yes, reset everything',
      danger: true
    });
    if (!ok) return;
    await api.post('/reset');
    toast('All data has been reset. The system has reawakened.', { type: 'achievement', title: '[ Reset Complete ]' });
    setTimeout(() => { window.location.href = '/'; }, 800);
  };

  if (!profile || !stats) return <p className="muted">Loading…</p>;

  const update = (key, value) => setProfile({ ...profile, [key]: value });

  return (
    <div>
      <h1 className="page-title">[ HUNTER PROFILE ]</h1>
      <p className="page-sub">Your registration with the system.</p>

      <div className="rank-hero">
        <RankSeal rank={stats.rank} size={120} />
        <div className="rank-hero-body">
          <span className="hero-greeting">Identification</span>
          <h2 className="rank-hero-title">{profile.name || 'Unnamed Hunter'}</h2>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            {stats.rank} · LV {stats.level} · {stats.xp} XP
          </p>
          <p className="faint" style={{ fontSize: 12, marginTop: 6 }}>
            Awakened {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 22 }}>
        <h3 className="panel-title">Identity</h3>
        <div className="form-grid">
          <div>
            <label className="form-label">Hunter Name</label>
            <input value={profile.name || ''} onChange={(e) => update('name', e.target.value)} placeholder="Hunter" />
          </div>
          <div>
            <label className="form-label">Age</label>
            <input type="number" value={profile.age || ''} onChange={(e) => update('age', e.target.value ? Number(e.target.value) : null)} placeholder="—" />
          </div>
          <div>
            <label className="form-label">Height (cm)</label>
            <input type="number" value={profile.height || ''} onChange={(e) => update('height', e.target.value ? Number(e.target.value) : null)} placeholder="—" />
          </div>
          <div>
            <label className="form-label">Goal</label>
            <select value={profile.goal || 'general_fitness'} onChange={(e) => update('goal', e.target.value)}>
              <option value="general_fitness">General Fitness</option>
              <option value="lose_weight">Lose Weight</option>
              <option value="build_muscle">Build Muscle</option>
              <option value="endurance">Endurance</option>
            </select>
          </div>
          <div>
            <label className="form-label">Current Weight (kg)</label>
            <input type="number" step="0.1" value={profile.startWeight || ''} onChange={(e) => update('startWeight', e.target.value ? Number(e.target.value) : null)} placeholder="—" />
          </div>
          <div>
            <label className="form-label">Goal Weight (kg)</label>
            <input type="number" step="0.1" value={profile.goalWeight || ''} onChange={(e) => update('goalWeight', e.target.value ? Number(e.target.value) : null)} placeholder="—" />
          </div>
        </div>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="primary" onClick={save}>Save Profile</button>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 22 }}>
        <h3 className="panel-title">System Stats</h3>
        <div className="grid cols-3">
          <div className="stat">
            <span className="stat-label">Achievements</span>
            <span className="stat-value gold">{stats.achievementsUnlocked}/{stats.achievementsTotal}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Best Streak</span>
            <span className="stat-value purple">{stats.bestStreak} days</span>
          </div>
          <div className="stat">
            <span className="stat-label">Sessions</span>
            <span className="stat-value success">{stats.totalSessions}</span>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 22, borderColor: 'rgba(255, 107, 156, 0.35)' }}>
        <h3 className="panel-title" style={{ color: 'var(--danger)' }}>Danger Zone</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Resetting wipes everything. Use this when you want to start fresh.
        </p>
        <button className="danger" onClick={reset}>Reset All Data</button>
      </div>
    </div>
  );
}
