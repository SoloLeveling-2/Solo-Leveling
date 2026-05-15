import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const empty = { name: '', muscleGroup: '', sets: '', reps: '', notes: '' };

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [form, setForm] = useState(empty);

  const load = () => api.get('/exercises').then(setExercises);

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await api.post('/exercises', form);
    setForm(empty);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Remove this exercise from your arsenal?')) return;
    await api.del(`/exercises/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="page-title">[ EXERCISE LIBRARY ]</h1>
      <p className="page-sub">Build your arsenal of movements.</p>

      <div className="panel">
        <h3 className="panel-title">Add Exercise</h3>
        <form className="row" onSubmit={submit}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ flex: 2 }}
          />
          <input
            placeholder="Muscle group"
            value={form.muscleGroup}
            onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })}
            style={{ flex: 1 }}
          />
          <input
            type="number"
            placeholder="Sets"
            value={form.sets}
            onChange={(e) => setForm({ ...form, sets: e.target.value })}
            style={{ width: 80 }}
          />
          <input
            type="number"
            placeholder="Reps"
            value={form.reps}
            onChange={(e) => setForm({ ...form, reps: e.target.value })}
            style={{ width: 80 }}
          />
          <input
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            style={{ flex: 2 }}
          />
          <button type="submit">Add</button>
        </form>
      </div>

      <div className="panel">
        <h3 className="panel-title">Arsenal · {exercises.length}</h3>
        {exercises.length === 0 ? (
          <p className="empty">No exercises yet. Add your first one above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Group</th>
                <th>Sets</th>
                <th>Reps</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td><span className="tag">{e.muscleGroup || '—'}</span></td>
                  <td>{e.sets}</td>
                  <td>{e.reps}</td>
                  <td className="muted">{e.notes || '—'}</td>
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
