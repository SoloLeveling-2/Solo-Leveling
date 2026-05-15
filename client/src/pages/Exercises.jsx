import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import ExerciseMedia from '../components/ExerciseMedia.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { useConfirm } from '../contexts/ConfirmContext.jsx';

const empty = {
  name: '',
  muscleGroup: '',
  sets: '',
  reps: '',
  notes: '',
  videoUrl: '',
  imageUrl: '',
  instructions: '',
  tips: ''
};

function muscleClass(group) {
  if (!group) return '';
  const g = group.toLowerCase();
  if (g.includes('chest')) return 'chest';
  if (g.includes('core') || g.includes('abs')) return 'core';
  if (g.includes('leg')) return 'legs';
  if (g.includes('cardio') || g.includes('run')) return 'cardio';
  return '';
}

export default function Exercises() {
  const toast = useToast();
  const confirm = useConfirm();
  const [exercises, setExercises] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/exercises').then(setExercises);

  useEffect(() => { load(); }, []);

  const startEdit = (e) => {
    setEditingId(e.id);
    setForm({
      name: e.name || '',
      muscleGroup: e.muscleGroup || '',
      sets: e.sets ?? '',
      reps: e.reps ?? '',
      notes: e.notes || '',
      videoUrl: e.videoUrl || '',
      imageUrl: e.imageUrl || '',
      instructions: (e.instructions || []).join('\n'),
      tips: (e.tips || []).join('\n')
    });
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(empty);
    setShowForm(false);
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      ...form,
      instructions: form.instructions.split('\n').map((l) => l.trim()).filter(Boolean),
      tips: form.tips.split('\n').map((l) => l.trim()).filter(Boolean)
    };
    if (editingId) {
      await api.put(`/exercises/${editingId}`, payload);
      toast(`${payload.name} updated.`, { type: 'success' });
    } else {
      await api.post('/exercises', payload);
      toast(`${payload.name} added to your arsenal.`, { type: 'success' });
    }
    cancelEdit();
    load();
  };

  const remove = async (id, name) => {
    const ok = await confirm({
      title: 'Remove exercise?',
      message: `This will remove "${name}" from your arsenal and unassign it from any scheduled days.`,
      confirmText: 'Remove',
      danger: true
    });
    if (!ok) return;
    await api.del(`/exercises/${id}`);
    toast(`${name} removed.`, { type: 'info' });
    load();
  };

  return (
    <div>
      <h1 className="page-title">[ EXERCISE ARSENAL ]</h1>
      <p className="page-sub">Manage your library. Add videos, images, and form tips so workouts are crystal clear.</p>

      <div className="flex-between" style={{ marginBottom: 16 }}>
        <span className="muted">{exercises.length} exercise{exercises.length === 1 ? '' : 's'} in your arsenal</span>
        {!showForm && (
          <button type="button" className="primary" onClick={() => { setShowForm(true); setEditingId(null); setForm(empty); }}>
            + Add Exercise
          </button>
        )}
      </div>

      {showForm && (
        <div className="panel panel-glow" style={{ marginBottom: 22 }}>
          <h3 className="panel-title">{editingId ? 'Edit Exercise' : 'Add Exercise'}</h3>
          <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 90px 90px', gap: 10 }}>
              <input
                placeholder="Name (e.g. Push-ups)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                placeholder="Muscle group"
                value={form.muscleGroup}
                onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })}
              />
              <input
                type="number"
                placeholder="Sets"
                value={form.sets}
                onChange={(e) => setForm({ ...form, sets: e.target.value })}
              />
              <input
                type="number"
                placeholder="Reps"
                value={form.reps}
                onChange={(e) => setForm({ ...form, reps: e.target.value })}
              />
            </div>
            <input
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input
                placeholder="YouTube URL or video ID"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              />
              <input
                placeholder="Image URL (optional)"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>
            <textarea
              placeholder="Step-by-step instructions (one step per line)"
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              rows={4}
            />
            <textarea
              placeholder="Form tips (one tip per line)"
              value={form.tips}
              onChange={(e) => setForm({ ...form, tips: e.target.value })}
              rows={3}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="ghost" onClick={cancelEdit}>Cancel</button>
              <button type="submit" className="primary">{editingId ? 'Save Changes' : 'Add to Arsenal'}</button>
            </div>
          </form>
        </div>
      )}

      {exercises.length === 0 ? (
        <div className="panel">
          <p className="empty">No exercises yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="exercise-grid">
          {exercises.map((e) => (
            <article key={e.id} className="exercise-card">
              <ExerciseMedia exercise={e} compact />
              <div className="exercise-card-header">
                <h3 className="exercise-card-name">{e.name}</h3>
                <span className={`tag ${muscleClass(e.muscleGroup)}`}>{e.muscleGroup || '—'}</span>
              </div>
              <div className="exercise-card-meta">
                <span><strong>{e.sets}</strong> sets</span>
                <span><strong>{e.reps}</strong> reps</span>
                {e.notes && <span className="muted">· {e.notes}</span>}
              </div>
              <div className="exercise-card-body">
                {e.instructions?.length > 0 && (
                  <details>
                    <summary style={{ cursor: 'pointer', color: 'var(--accent-strong)', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>
                      Instructions ({e.instructions.length})
                    </summary>
                    <ol style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8, paddingLeft: 18, lineHeight: 1.5 }}>
                      {e.instructions.map((line, i) => <li key={i}>{line}</li>)}
                    </ol>
                  </details>
                )}
                {e.tips?.length > 0 && (
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ cursor: 'pointer', color: 'var(--accent-strong)', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>
                      Form Tips ({e.tips.length})
                    </summary>
                    <ul style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8, paddingLeft: 18, lineHeight: 1.5 }}>
                      {e.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </details>
                )}
              </div>
              <div className="exercise-card-actions">
                <button className="ghost tiny" onClick={() => startEdit(e)}>Edit</button>
                <button className="danger tiny" onClick={() => remove(e.id, e.name)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
