import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import HeatmapCalendar from '../components/HeatmapCalendar.jsx';
import StatRadar from '../components/StatRadar.jsx';
import RankSeal from '../components/RankSeal.jsx';

function buildWeightChart(entries) {
  if (!entries || entries.length === 0) {
    return { path: '', points: [], minY: 0, maxY: 0 };
  }
  const weights = entries.map((e) => e.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;
  const padTop = 6;
  const padBottom = 8;
  const chartHeight = 100 - padTop - padBottom;

  const points = entries.map((e, i) => {
    const x = entries.length === 1 ? 50 : (i / (entries.length - 1)) * 100;
    const y = padTop + chartHeight - ((e.weight - minW) / range) * chartHeight;
    return { x, y, weight: e.weight, date: e.date };
  });
  const path = points.map((p) => `${p.x},${p.y}`).join(' ');
  return { path, points, minY: minW.toFixed(1), maxY: maxW.toFixed(1) };
}

export default function Progress() {
  const [history, setHistory] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/history'), api.get('/stats')]).then(([h, s]) => {
      setHistory(h);
      setStats(s);
    });
  }, []);

  const chart = useMemo(() => buildWeightChart(history?.weights || []), [history]);

  if (!history || !stats) return <p className="muted">Loading…</p>;

  const last7 = history.last90.slice(-7);
  const last30 = history.last90.slice(-30);
  const last7Pct = Math.round((last7.filter((d) => d.completed).length / 7) * 100);
  const last30Pct = Math.round((last30.filter((d) => d.completed).length / 30) * 100);
  const startWeight = history.weights[0]?.weight;
  const latestWeight = history.weights[history.weights.length - 1]?.weight;
  const weightChange = startWeight != null && latestWeight != null
    ? (latestWeight - startWeight).toFixed(1)
    : null;
  const totalSessionMin = Math.round((history.sessions || []).reduce((s, x) => s + (x.durationSeconds || 0), 0) / 60);

  return (
    <div>
      <h1 className="page-title">[ PROGRESS ]</h1>
      <p className="page-sub">Visualize your ascent. Every cleared day moves you forward.</p>

      <div className="rank-hero">
        <RankSeal rank={stats.rank} size={120} />
        <div className="rank-hero-body">
          <span className="hero-greeting">Current Rank</span>
          <h2 className="rank-hero-title">{stats.rank}</h2>
          <p className="muted" style={{ margin: '4px 0 14px' }}>
            Level {stats.level} · {stats.xp} XP · {stats.totalCompleted} quests cleared
          </p>
          {stats.nextRank && (
            <>
              <div className="bar-label">
                <span>Next: {stats.nextRank}</span>
                <strong>{Math.round(stats.progressToNext)}%</strong>
              </div>
              <div className="progress" style={{ maxWidth: 380 }}>
                <div className="progress-fill purple" style={{ width: `${stats.progressToNext}%` }} />
              </div>
              <p className="faint" style={{ fontSize: 12, marginTop: 6 }}>
                {stats.daysToNextRank} more quest day{stats.daysToNextRank === 1 ? '' : 's'} to advance
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid cols-2" style={{ marginTop: 22 }}>
        <div className="panel">
          <h3 className="panel-title">Stat Profile</h3>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <StatRadar stats={stats.statBreakdown} size={240} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="faint" style={{ fontSize: 10, letterSpacing: 2 }}>STRENGTH</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent-strong)' }}>{stats.statBreakdown.strength}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="faint" style={{ fontSize: 10, letterSpacing: 2 }}>ENDURANCE</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--success)' }}>{stats.statBreakdown.endurance}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="faint" style={{ fontSize: 10, letterSpacing: 2 }}>DISCIPLINE</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--purple)' }}>{stats.statBreakdown.discipline}</div>
            </div>
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">Streak Records</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="stat">
              <span className="stat-label">Current</span>
              <span className="stat-value gold">{stats.currentStreak}🔥</span>
              <span className="stat-sub">days in a row</span>
            </div>
            <div className="stat">
              <span className="stat-label">Best Ever</span>
              <span className="stat-value purple">{stats.bestStreak}</span>
              <span className="stat-sub">longest streak</span>
            </div>
            <div className="stat">
              <span className="stat-label">Last 7 Days</span>
              <span className="stat-value">{last7Pct}%</span>
              <div className="progress" style={{ marginTop: 6 }}>
                <div className="progress-fill success" style={{ width: `${last7Pct}%` }} />
              </div>
            </div>
            <div className="stat">
              <span className="stat-label">Last 30 Days</span>
              <span className="stat-value">{last30Pct}%</span>
              <div className="progress" style={{ marginTop: 6 }}>
                <div className="progress-fill" style={{ width: `${last30Pct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 22 }}>
        <h3 className="panel-title">Quest Heatmap · Last 90 days</h3>
        <HeatmapCalendar data={history.last90} />
      </div>

      <div className="grid cols-2" style={{ marginTop: 22 }}>
        <div className="panel">
          <h3 className="panel-title">Weight Trend</h3>
          {history.weights.length === 0 ? (
            <p className="empty">No weight entries yet — log one on the Weight page.</p>
          ) : (
            <>
              <div className="weight-chart">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                  {[20, 40, 60, 80].map((y) => (
                    <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(80,156,255,0.1)" strokeWidth="0.2" />
                  ))}
                  {chart.path && (
                    <>
                      <polyline points={chart.path} fill="none" stroke="var(--accent)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
                      {chart.points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="0.9" fill="var(--accent-strong)" />
                      ))}
                    </>
                  )}
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: 'var(--text-dim)' }}>
                <span>Start: {startWeight} kg</span>
                <span>Current: {latestWeight} kg</span>
                <span style={{ color: weightChange > 0 ? 'var(--warn)' : 'var(--success)' }}>
                  Δ {weightChange > 0 ? '+' : ''}{weightChange} kg
                </span>
              </div>
            </>
          )}
        </div>

        <div className="panel">
          <h3 className="panel-title">Workout Sessions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="stat">
              <span className="stat-label">Sessions</span>
              <span className="stat-value">{stats.totalSessions}</span>
              <span className="stat-sub">all-time</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Time</span>
              <span className="stat-value">{totalSessionMin}<span style={{ fontSize: 14 }}>m</span></span>
              <span className="stat-sub">across all sessions</span>
            </div>
            <div className="stat">
              <span className="stat-label">Meals Logged</span>
              <span className="stat-value success">{stats.totalMeals}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Weight Entries</span>
              <span className="stat-value purple">{stats.totalWeights}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
