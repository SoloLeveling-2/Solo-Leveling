import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Exercises from './pages/Exercises.jsx';
import Schedule from './pages/Schedule.jsx';
import Meals from './pages/Meals.jsx';
import Weight from './pages/Weight.jsx';
import Checklist from './pages/Checklist.jsx';
import { api } from './api/client.js';

const NAV = [
  { to: '/', label: 'Dashboard', end: true, icon: '◈' },
  { to: '/quest', label: 'Daily Quest', icon: '✦' },
  { to: '/exercises', label: 'Exercises', icon: '◇' },
  { to: '/schedule', label: 'Schedule', icon: '◐' },
  { to: '/meals', label: 'Meals', icon: '◍' },
  { to: '/weight', label: 'Weight', icon: '◎' }
];

export default function App() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => api.get('/stats').then((s) => { if (!cancelled) setStats(s); }).catch(() => {});
    refresh();
    const id = setInterval(refresh, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">[ SYSTEM ]</span>
          <span className="brand-title">Hunter Tracker</span>
          <span className="brand-sub">Arise &amp; Train</span>
        </div>
        <nav>
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
        {stats && (
          <div className="sidebar-rank">
            <div className="sidebar-rank-label">Current Rank</div>
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
          </div>
        )}
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quest" element={<Checklist />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/weight" element={<Weight />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
