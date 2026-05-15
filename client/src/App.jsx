import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Exercises from './pages/Exercises.jsx';
import Schedule from './pages/Schedule.jsx';
import Meals from './pages/Meals.jsx';
import Weight from './pages/Weight.jsx';
import Checklist from './pages/Checklist.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/quest', label: 'Daily Quest' },
  { to: '/exercises', label: 'Exercises' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/meals', label: 'Meals' },
  { to: '/weight', label: 'Weight' }
];

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">[ SYSTEM ]</span>
          <span className="brand-title">Hunter Tracker</span>
        </div>
        <nav>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>Arise.</p>
        </div>
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
