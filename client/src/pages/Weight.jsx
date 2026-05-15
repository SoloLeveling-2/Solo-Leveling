import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

export default function Weight() {
  const [entries, setEntries] = useState([]);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const load = () => api.get('/weights').then(setEntries);

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!weight) return;
    await api.post('/weights', { weight, date });
    setWeight('');
    load();
  };

  const remove = async (id) => {
    await api.del(`/weights/${id}`);
    load();
  };

  const chart = useMemo(() => buildChart(entries), [entries]);
  const latest = entries[entries.length - 1];
  const first = entries[0];
  const change = latest && first ? (latest.weight - first.weight).toFixed(1) : null;

  return (
    <div>
      <h1 className="page-title">[ WEIGHT LOG ]</h1>
      <p className="page-sub">Track your transformation.</p>

      <div className="grid cols-3">
        <div className="panel stat">
          <span className="stat-label">Current</span>
          <span className="stat-value">{latest ? `${latest.weight} kg` : '—'}</span>
          <span className="stat-sub">{latest?.date || 'No entries'}</span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Starting</span>
          <span className="stat-value">{first ? `${first.weight} kg` : '—'}</span>
          <span className="stat-sub">{first?.date || ''}</span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Change</span>
          <span className="stat-value" style={{ color: change > 0 ? 'var(--warn)' : 'var(--success)' }}>
            {change !== null ? `${change > 0 ? '+' : ''}${change} kg` : '—'}
          </span>
          <span className="stat-sub">{entries.length} entries</span>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <h3 className="panel-title">Log Weight</h3>
        <form className="row" onSubmit={submit}>
          <input
            type="number"
            step="0.1"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={{ width: 160 }}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button type="submit">Log Weight</button>
        </form>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <h3 className="panel-title">Trend</h3>
        {entries.length === 0 ? (
          <p className="empty">No data to chart yet.</p>
        ) : (
          <div className="weight-chart">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              {chart.gridLines.map((y, i) => (
                <line key={i} x1="0" x2="100" y1={y} y2={y} stroke="rgba(80,156,255,0.1)" strokeWidth="0.2" />
              ))}
              {chart.path && (
                <>
                  <polyline
                    points={chart.path}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="0.6"
                    vectorEffect="non-scaling-stroke"
                  />
                  {chart.points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r="0.9"
                      fill="var(--accent-strong)"
                    />
                  ))}
                </>
              )}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-dim)', marginTop: 8 }}>
              <span>{chart.minY} kg</span>
              <span>{chart.maxY} kg</span>
            </div>
          </div>
        )}
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <h3 className="panel-title">Entries</h3>
        {entries.length === 0 ? (
          <p className="empty">No weight entries yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...entries].reverse().map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.weight} kg</td>
                  <td className="row-actions">
                    <button className="danger" onClick={() => remove(e.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function buildChart(entries) {
  if (entries.length === 0) {
    return { path: '', points: [], gridLines: [], minY: 0, maxY: 0 };
  }
  const weights = entries.map((e) => e.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;
  const padTop = 5;
  const padBottom = 5;
  const chartHeight = 100 - padTop - padBottom;

  const points = entries.map((e, i) => {
    const x = entries.length === 1 ? 50 : (i / (entries.length - 1)) * 100;
    const y = padTop + chartHeight - ((e.weight - minW) / range) * chartHeight;
    return { x, y };
  });

  const path = points.map((p) => `${p.x},${p.y}`).join(' ');
  const gridLines = [10, 30, 50, 70, 90];

  return {
    path,
    points,
    gridLines,
    minY: minW.toFixed(1),
    maxY: maxW.toFixed(1)
  };
}
