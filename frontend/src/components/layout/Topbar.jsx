import { useEffect, useState } from 'react';
import { FiBell, FiMenu, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../common/ThemeToggle';
import { notificationsApi } from '../../api/notifications';
import { formatRelative } from '../../utils/date';

export default function Topbar({ onMenuClick }) {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const data = await notificationsApi.list();
      setNotifs(data);
    } catch {}
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const unread = notifs.filter((n) => !n.is_read).length;

  const markAll = async () => {
    await notificationsApi.markAllRead();
    load();
  };

  return (
    <div className="h-16 px-4 md:px-6 flex items-center gap-3 sticky top-0 z-30 glass-strong border-b border-white/10">
      <button
        onClick={onMenuClick}
        className="lg:hidden h-9 w-9 grid place-items-center rounded-xl hover:bg-white/10"
      >
        <FiMenu className="h-5 w-5" />
      </button>

      <div className="hidden md:flex flex-1 max-w-md relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          placeholder="Search tasks, people, teams..."
          className="input pl-10"
        />
      </div>

      <div className="flex-1 md:hidden" />

      <ThemeToggle />

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative h-9 w-9 grid place-items-center rounded-xl glass hover:bg-white/80 dark:hover:bg-white/10"
          aria-label="Notifications"
        >
          <FiBell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full text-[10px] font-bold grid place-items-center bg-gradient-to-r from-brand-900 via-brand-600 to-brand-400 text-white shadow-lg">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="absolute right-0 top-12 w-80 glass-strong rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-3 flex items-center justify-between border-b border-white/10">
                <p className="font-semibold text-sm">Notifications</p>
                {unread > 0 && (
                  <button onClick={markAll} className="text-xs text-brand-700 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 && (
                  <p className="text-sm text-slate-500 p-6 text-center">You're all caught up</p>
                )}
                {notifs.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-white/5 last:border-0 ${
                      n.is_read ? 'opacity-60' : ''
                    }`}
                  >
                    <p className="text-sm">{n.message}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{formatRelative(n.created_at)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
