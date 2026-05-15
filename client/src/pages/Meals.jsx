import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const PROTEIN_GOAL = 120;

const RECOMMENDED_MEALS = [
  { name: 'Eggs + Whole-Grain Toast', type: 'Breakfast', calories: 430, protein: 28, note: '3 eggs, 2 slices toast, fruit on the side' },
  { name: 'Greek Yogurt + Granola', type: 'Breakfast', calories: 360, protein: 30, note: 'Plain Greek yogurt, granola, berries, honey' },
  { name: 'Chicken Rice Bowl', type: 'Lunch', calories: 620, protein: 48, note: 'Chicken breast, rice, vegetables, light sauce' },
  { name: 'Tuna Sandwich', type: 'Lunch', calories: 410, protein: 34, note: 'Tuna, whole-grain bread, lettuce, tomato' },
  { name: 'Protein Smoothie', type: 'Snack', calories: 390, protein: 35, note: 'Protein powder, milk, banana, oats' },
  { name: 'Turkey Rice Bowl', type: 'Dinner', calories: 590, protein: 44, note: 'Lean turkey, rice, avocado, salsa, greens' },
  { name: 'Peanut Butter Banana Smoothie', type: 'Snack', calories: 520, protein: 32, note: 'Milk, banana, peanut butter, protein powder' },
  { name: 'Chicken/Salmon + Potatoes', type: 'Dinner', calories: 650, protein: 50, note: 'Grilled chicken or salmon, roasted potatoes, veggies' }
];

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

  const fillMeal = (meal) => {
    setForm({
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      type: meal.type,
      date: new Date().toISOString().slice(0, 10)
    });
    setTimeout(() => document.querySelector('.meal-log-panel input')?.focus(), 50);
  };

  const quickLogMeal = async (meal) => {
    await api.post('/meals', {
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      type: meal.type,
      date: new Date().toISOString().slice(0, 10)
    });
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
  const proteinProgress = Math.min(100, Math.round((todayProtein / PROTEIN_GOAL) * 100));
  const remainingProtein = Math.max(PROTEIN_GOAL - todayProtein, 0);

  const grouped = useMemo(() => meals.reduce((acc, m) => {
    (acc[m.date] = acc[m.date] || []).push(m);
    return acc;
  }, {}), [meals]);
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <h1 className="page-title">[ MEALS ]</h1>
      <p className="page-sub">Fuel your ascent with simple high-protein meals and daily nutrition tracking.</p>

      <div className="grid cols-3 nutrition-stats">
        <div className="panel stat">
          <span className="stat-label">Today's Calories</span>
          <span className="stat-value">{todayCalories} kcal</span>
          <span className="stat-sub">{todayMeals.length} meals logged</span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Today's Protein</span>
          <span className="stat-value success">{todayProtein} g</span>
          <span className="stat-sub">{remainingProtein}g remaining to goal</span>
        </div>
        <div className="panel stat protein-goal-card">
          <span className="stat-label">Daily Protein Goal</span>
          <span className="stat-value">{PROTEIN_GOAL} g</span>
          <div className="protein-progress" aria-label={`${proteinProgress}% of protein goal complete`}>
            <span style={{ width: `${proteinProgress}%` }} />
          </div>
          <span className="stat-sub">{proteinProgress}% complete</span>
        </div>
      </div>

      <section className="panel protein-recs-panel featured-protein-section" style={{ marginTop: 20 }}>
        <div className="section-heading protein-section-heading">
          <div>
            <p className="eyebrow">Beginner friendly quick logs</p>
            <h2 className="recommended-meals-title">Recommended Protein Meals</h2>
          </div>
          <span className="muted">Tap quick log, or fill the form to customize.</span>
        </div>
        {RECOMMENDED_MEALS.length === 0 ? (
          <p className="empty">Recommended Protein Meals are loading. You can still log a custom meal below.</p>
        ) : (
          <div className="meal-card-grid">
            {RECOMMENDED_MEALS.map((meal) => (
              <article key={meal.name} className="meal-card">
                <div className="meal-card-top">
                  <span className="tag">{meal.type}</span>
                  <strong>{meal.protein}g protein</strong>
                </div>
                <h4>{meal.name}</h4>
                <p>{meal.note}</p>
                <div className="meal-metrics">
                  <span>{meal.calories} kcal</span>
                  <span>{meal.protein}g protein</span>
                </div>
                <div className="meal-actions">
                  <button type="button" className="tiny primary" onClick={() => quickLogMeal(meal)}>Quick Log</button>
                  <button type="button" className="tiny ghost" onClick={() => fillMeal(meal)}>Auto-fill</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="panel meal-log-panel" style={{ marginTop: 20 }}>
        <h3 className="panel-title">Log Meal</h3>
        <form className="row meal-form" onSubmit={submit}>
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
            <div key={date} className="panel meal-history-panel" style={{ marginTop: 20 }}>
              <div className="flex-between meal-history-heading">
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
