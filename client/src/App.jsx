import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Exercises from './pages/Exercises.jsx';
import Schedule from './pages/Schedule.jsx';
import Meals from './pages/Meals.jsx';
import Weight from './pages/Weight.jsx';
import Checklist from './pages/Checklist.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Progress from './pages/Progress.jsx';
import Achievements from './pages/Achievements.jsx';
import Profile from './pages/Profile.jsx';
import Session from './pages/Session.jsx';
import { api } from './api/client.js';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { ConfirmProvider } from './contexts/ConfirmContext.jsx';
import RankSeal from './components/RankSeal.jsx';

const APP_VERSION_LABEL = 'Version: PR5 media + meals + schedule';

const NAV = [
  { to: '/', label: 'Dashboard', end: true, icon: '◈' },
  { to: '/quest', label: 'Daily Quest', icon: '✦' },
  { to: '/session', label: 'Active Session', icon: '▶' },
  { to: '/exercises', label: 'Exercises', icon: '◇' },
  { to: '/schedule', label: 'Schedule', icon: '◐' },
  { to: '/progress', label: 'Progress', icon: '◊' },
  { to: '/achievements', label: 'Achievements', icon: '★' },
  { to: '/meals', label: 'Meals', icon: '◍' },
  { to: '/weight', label: 'Weight', icon: '◎' },
  { to: '/profile', label: 'Profile', icon: '◉' }
];

function Shell() {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      Promise.all([api.get('/stats'), api.get('/profile')])
        .then(([s, p]) => { if (!cancelled) { setStats(s); setProfile(p); } })
        .catch(() => {});
    };
    refresh();
    const id = setInterval(refresh, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  useEffect(() => {
    if (profile && !profile.onboarded && location.pathname !== '/welcome') {
      navigate('/welcome', { replace: true });
    }
  }, [profile, location.pathname, navigate]);

  if (location.pathname === '/welcome') {
    return (
      <main className="onboarding-content">
        <Routes>
          <Route path="/welcome" element={<Onboarding />} />
        </Routes>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">[ SYSTEM ]</span>
          <span className="brand-title">Hunter Tracker</span>
          {profile?.name && <span className="brand-sub">Welcome, {profile.name}</span>}
          {!profile?.name && <span className="brand-sub">Arise &amp; Train</span>}
        </div>
        <nav className="nav-list">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="app-version-badge" title="Local build marker">
          <span className="app-version-dot" aria-hidden="true" />
          <span>{APP_VERSION_LABEL}</span>
        </div>
        {stats && (
          <div className="sidebar-rank">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              <RankSeal rank={stats.rank} size={64} />
            </div>
            <div className="sidebar-rank-value">{stats.rank}</div>
            <div style={{ marginTop: 10 }}>
              <div className="bar-label" style={{ fontSize: 9, marginBottom: 4 }}>
                <span>LV {stats.level}</span>
                <span>{Math.round(stats.xpProgress)}%</span>
              </div>
              <div className="progress" style={{ height: 6 }}>
                <div className="progress-fill purple" style={{ width: `${stats.xpProgress}%` }} />
              </div>
            </div>
            <div className="streak-pill">
              <span className="flame">🔥</span> <strong>{stats.currentStreak}</strong> day streak
            </div>
          </div>
        )}
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quest" element={<Checklist />} />
          <Route path="/session" element={<Session />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/weight" element={<Weight />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Shell />
      </ConfirmProvider>
    </ToastProvider>
  );
}
