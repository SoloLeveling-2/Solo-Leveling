import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const TIER_ORDER = { bronze: 0, silver: 1, gold: 2, legendary: 3 };

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => { api.get('/achievements').then(setAchievements); }, []);

  const unlocked = achievements.filter((a) => a.unlocked).length;
  const total = achievements.length;
  const pct = total ? Math.round((unlocked / total) * 100) : 0;

  const grouped = achievements.reduce((acc, a) => {
    (acc[a.tier] = acc[a.tier] || []).push(a);
    return acc;
  }, {});
  const tiers = Object.keys(grouped).sort((a, b) => TIER_ORDER[a] - TIER_ORDER[b]);

  return (
    <div>
      <h1 className="page-title">[ ACHIEVEMENTS ]</h1>
      <p className="page-sub">Earn medals by completing milestones. The system remembers every victory.</p>

      <div className="panel panel-glow">
        <div className="flex-between">
          <h3 className="panel-title">Progress</h3>
          <span className="muted">{unlocked}/{total} unlocked</span>
        </div>
        <div className="progress" style={{ marginBottom: 8 }}>
          <div className="progress-fill gold" style={{ width: `${pct}%` }} />
        </div>
        <p className="faint" style={{ fontSize: 12, margin: 0 }}>{pct}% complete</p>
      </div>

      {tiers.map((tier) => (
        <div key={tier} className="panel" style={{ marginTop: 22 }}>
          <h3 className="panel-title">
            {tier === 'bronze' && '✦ Bronze'}
            {tier === 'silver' && '✧ Silver'}
            {tier === 'gold' && '★ Gold'}
            {tier === 'legendary' && '✪ Legendary'}
          </h3>
          <div className="achievement-grid">
            {grouped[tier].map((a) => (
              <div key={a.id} className={`achievement-card tier-${a.tier}${a.unlocked ? ' unlocked' : ''}`}>
                <div className="achievement-icon">{a.icon}</div>
                <div className="achievement-body">
                  <h4>{a.name}</h4>
                  <p>{a.desc}</p>
                </div>
                <div className="achievement-status">
                  {a.unlocked ? <span className="badge-unlocked">UNLOCKED</span> : <span className="badge-locked">LOCKED</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
