import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCheckSquare, FiActivity, FiAlertTriangle, FiClock, FiArrowRight, FiPlus,
} from 'react-icons/fi';
import { analyticsApi } from '../api/analytics';
import { tasksApi } from '../api/tasks';
import { useAuthStore } from '../store/authStore';
import Card from '../components/ui/Card';
import Skeleton from '../components/common/Skeleton';
import Badge, { priorityTone, statusLabel, statusTone } from '../components/ui/Badge';
import { formatDate, formatRelative } from '../utils/date';

const STAT_CARDS = [
  { key: 'total', label: 'Total Tasks', icon: FiCheckSquare, tone: 'from-brand-900 to-brand-500' },
  { key: 'in_progress', label: 'In Progress', icon: FiActivity, tone: 'from-brand-700 to-brand-500' },
  { key: 'done', label: 'Completed', icon: FiCheckSquare, tone: 'from-brand-700 to-brand-500' },
  { key: 'overdue', label: 'Overdue', icon: FiAlertTriangle, tone: 'from-brand-900 to-brand-500' },
];

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.overview(), tasksApi.list()])
      .then(([s, t]) => {
        setStats(s);
        setTasks(t.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between flex-wrap gap-4"
      >
        <div>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-bold mt-1">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
        </div>
        <Link to="/tasks" className="btn-primary">
          <FiPlus className="h-4 w-4" /> New Task
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5 overflow-hidden relative"
          >
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.tone} opacity-20 blur-2xl`} />
            <div className="flex items-start justify-between relative">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">{s.label}</p>
                <p className="text-3xl font-bold mt-1">
                  {loading ? <span className="inline-block w-12 h-8"><Skeleton className="h-8 w-12" /></span> : (stats?.totals?.[s.key] ?? 0)}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.tone} grid place-items-center text-white shadow-lg`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm text-brand-700 hover:underline inline-flex items-center gap-1">
              View all <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No tasks yet — create your first one.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {tasks.map((t) => (
                <li key={t.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{t.title}</p>
                    <p className="text-xs text-slate-500">
                      {t.deadline ? `Due ${formatDate(t.deadline)}` : 'No deadline'}
                    </p>
                  </div>
                  <Badge tone={priorityTone[t.priority]}>{t.priority}</Badge>
                  <Badge tone={statusTone[t.status]}>{statusLabel[t.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Activity</h2>
            <FiClock className="h-4 w-4 text-slate-400" />
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : (stats?.recent?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.recent.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-brand-200/70 text-brand-700 grid place-items-center text-xs font-bold shrink-0">
                    {a.action.split('.')[0][0]?.toUpperCase()}
                  </div>
                  <div className="text-sm min-w-0">
                    <p className="truncate"><span className="font-medium">{a.user_name}</span> · {a.action}</p>
                    <p className="text-xs text-slate-500">{formatRelative(a.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
