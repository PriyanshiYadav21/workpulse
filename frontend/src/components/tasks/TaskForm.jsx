import { useEffect, useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { usersApi } from '../../api/users';

const STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];
const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export default function TaskForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    category: '',
    deadline: '',
    assigned_to: '',
    ...(initial || {}),
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    usersApi.list().then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        description: initial.description || '',
        status: initial.status || 'todo',
        priority: initial.priority || 'medium',
        category: initial.category || '',
        deadline: initial.deadline ? initial.deadline.slice(0, 10) : '',
        assigned_to: initial.assigned_to || '',
      });
    }
  }, [initial]);

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      category: form.category.trim() || null,
      deadline: form.deadline || null,
      assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input label="Title" value={form.title} onChange={(e) => handleChange('title', e.target.value)} required />

      <label className="block">
        <span className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Description</span>
        <textarea
          rows={4}
          className="input resize-y"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Status</span>
          <select
            className="input"
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Priority</span>
          <select
            className="input"
            value={form.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
          >
            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Category" value={form.category} onChange={(e) => handleChange('category', e.target.value)} placeholder="Design, Engineering..." />
        <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => handleChange('deadline', e.target.value)} />
      </div>

      <label className="block">
        <span className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Assignee</span>
        <select
          className="input"
          value={form.assigned_to}
          onChange={(e) => handleChange('assigned_to', e.target.value)}
        >
          <option value="">Unassigned</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
        </select>
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Task'}</Button>
      </div>
    </form>
  );
}
