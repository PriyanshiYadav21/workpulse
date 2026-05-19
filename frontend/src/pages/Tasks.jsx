import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiGrid, FiList, FiCheckSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { tasksApi } from '../api/tasks';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';

const PRIORITIES = ['', 'low', 'medium', 'high', 'urgent'];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban');
  const [q, setQ] = useState('');
  const [priority, setPriority] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await tasksApi.list();
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (priority && t.priority !== priority) return false;
      if (q) {
        const s = q.toLowerCase();
        return (
          t.title.toLowerCase().includes(s) ||
          (t.description || '').toLowerCase().includes(s) ||
          (t.category || '').toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [tasks, q, priority]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (task) => { setEditing(task); setModalOpen(true); };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editing) {
        const updated = await tasksApi.update(editing.id, payload);
        setTasks((arr) => arr.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
        toast.success('Task updated');
      } else {
        const created = await tasksApi.create(payload);
        setTasks((arr) => [created, ...arr]);
        toast.success('Task created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (task) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await tasksApi.remove(task.id);
      setTasks((arr) => arr.filter((t) => t.id !== task.id));
      toast.success('Task deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleBoardChange = async (next) => {
    setTasks(next);
    try {
      await tasksApi.reorder(next.map((t) => ({ id: t.id, status: t.status, position: t.position || 0 })));
    } catch {
      toast.error('Could not save order');
      load();
    }
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} tasks</p>
        </div>
        <Button onClick={openCreate}><FiPlus className="h-4 w-4" /> New Task</Button>
      </motion.div>

      <div className="card p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks..." className="input pl-10" />
        </div>
        <div className="relative">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input pl-10 pr-8">
            <option value="">All priorities</option>
            {PRIORITIES.filter(Boolean).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex gap-1 rounded-xl glass p-1">
          <button
            onClick={() => setView('kanban')}
            className={`h-8 w-8 grid place-items-center rounded-lg ${view === 'kanban' ? 'bg-gradient-to-r from-brand-900 to-brand-500 text-white' : 'hover:bg-white/10'}`}
            title="Board view"
          ><FiGrid className="h-4 w-4" /></button>
          <button
            onClick={() => setView('list')}
            className={`h-8 w-8 grid place-items-center rounded-lg ${view === 'list' ? 'bg-gradient-to-r from-brand-900 to-brand-500 text-white' : 'hover:bg-white/10'}`}
            title="List view"
          ><FiList className="h-4 w-4" /></button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FiCheckSquare}
          title="No tasks match"
          description="Create one to get started or tweak your filters."
          action={<Button onClick={openCreate}><FiPlus className="h-4 w-4" /> New Task</Button>}
        />
      ) : view === 'kanban' ? (
        <KanbanBoard tasks={filtered} onChange={handleBoardChange} onEdit={openEdit} onDelete={handleDelete} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((t) => <TaskCard key={t.id} task={t} onEdit={openEdit} onDelete={handleDelete} />)}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Task' : 'Create Task'}
        size="lg"
      >
        <TaskForm
          initial={editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
