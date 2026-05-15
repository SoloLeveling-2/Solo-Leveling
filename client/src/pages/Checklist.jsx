import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function Checklist() {
  const [items, setItems] = useState([]);
  const [date, setDate] = useState('');
  const [text, setText] = useState('');

  const load = () => api.get('/checklist').then((data) => {
    setItems(data.items);
    setDate(data.date);
  });

  useEffect(() => { load(); }, []);

  const toggle = async (item) => {
    await api.put(`/checklist/${item.id}`, { done: !item.done });
    load();
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await api.post('/checklist', { text: text.trim() });
    setText('');
    load();
  };

  const remove = async (id) => {
    await api.del(`/checklist/${id}`);
    load();
  };

  const completed = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <h1 className="page-title">[ DAILY QUEST ]</h1>
      <p className="page-sub">Date: {date} · Complete all tasks before the day resets.</p>

      <div className="panel">
        <div className="flex-between">
          <h3 className="panel-title">Progress · {completed}/{total}</h3>
          <span className="muted">{pct}%</span>
        </div>
        <div className="progress" style={{ marginBottom: 20 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>

        <form className="row" onSubmit={addItem}>
          <input
            placeholder="Add a quest objective..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit">Add Objective</button>
        </form>

        {items.length === 0 ? (
          <p className="empty">No objectives yet. The system awaits your orders.</p>
        ) : (
          <ul className="checklist">
            {items.map((item) => (
              <li key={item.id} className={`checklist-item${item.done ? ' done' : ''}`}>
                <button
                  className={`checkbox${item.done ? ' done' : ''}`}
                  onClick={() => toggle(item)}
                  aria-label={item.done ? 'Mark incomplete' : 'Mark complete'}
                >
                  {item.done ? '✓' : ''}
                </button>
                <span className="text">{item.text}</span>
                <button className="danger" onClick={() => remove(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pct === 100 && total > 0 && (
        <div className="panel" style={{ marginTop: 20, borderColor: 'rgba(109,255,181,0.5)' }}>
          <h3 className="panel-title" style={{ color: 'var(--success)' }}>[ QUEST COMPLETE ]</h3>
          <p className="muted">You have grown stronger. Rest, hunter.</p>
        </div>
      )}
    </div>
  );
}
