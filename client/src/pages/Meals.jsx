import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const empty = () => ({
  name: '',
  calories: '',
  protein: '',
  type: 'Breakfast',
  date: new Date().toISOString().slice(0, 10)
});

export default function Meals() {
  const [meals, setMeals] = useState([]);
  const [form, setForm] = useState(empty());

  const load = () => api.get('/meals').then(setMeals);

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await api.post('/meals', form);
    setForm(empty());
    load();
  };

  const remove = async (id) => {
    await api.del(`/meals/${id}`);
    load();
  };

  const todayDate = new Date().toISOString().slice(0, 10);
  const todayMeals = meals.filter((m) => m.date === todayDate);
  const todayCalories = todayMeals.reduce((s, m) => s + m.calories, 0);
  const todayProtein = todayMeals.reduce((s, m) => s + m.protein, 0);

  const grouped = meals.reduce((acc, m) => {
    (acc[m.date] = acc[m.date] || []).push(m);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <h1 className="page-title">[ MEALS ]</h1>
      <p className="page-sub">Fuel your ascent.</p>

      <div className="grid cols-2">
        <div className="panel stat">
          <span className="stat-label">Today's Calories</span>
          <span className="stat-value">{todayCalories} kcal</span>
          <span className="stat-sub">{todayMeals.length} meals logged</span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Today's Protein</span>
          <span className="stat-value">{todayProtein} g</span>
          <span className="stat-sub">across {todayMeals.length} entries</span>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <h3 className="panel-title">Log Meal</h3>
        <form className="row" onSubmit={submit}>
          <input
            placeholder="Meal name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ flex: 2 }}
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input
            type="number"
            placeholder="kcal"
            value={form.calories}
            onChange={(e) => setForm({ ...form, calories: e.target.value })}
            style={{ width: 100 }}
          />
          <input
            type="number"
            placeholder="protein (g)"
            value={form.protein}
            onChange={(e) => setForm({ ...form, protein: e.target.value })}
            style={{ width: 120 }}
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <button type="submit">Log</button>
        </form>
      </div>

      {dates.length === 0 ? (
        <div className="panel" style={{ marginTop: 20 }}>
          <p className="empty">No meals logged yet.</p>
        </div>
      ) : (
        dates.map((date) => {
          const dayMeals = grouped[date];
          const dayCal = dayMeals.reduce((s, m) => s + m.calories, 0);
          const dayPro = dayMeals.reduce((s, m) => s + m.protein, 0);
          return (
            <div key={date} className="panel" style={{ marginTop: 20 }}>
              <div className="flex-between">
                <h3 className="panel-title">{date}</h3>
                <span className="muted">{dayCal} kcal · {dayPro}g protein</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Meal</th>
                    <th>Type</th>
                    <th>Calories</th>
                    <th>Protein</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {dayMeals.map((m) => (
                    <tr key={m.id}>
                      <td>{m.name}</td>
                      <td><span className="tag">{m.type}</span></td>
                      <td>{m.calories} kcal</td>
                      <td>{m.protein} g</td>
                      <td className="row-actions">
                        <button className="danger" onClick={() => remove(m.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}
