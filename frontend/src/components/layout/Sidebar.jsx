import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiGrid, FiCheckSquare, FiUsers, FiBarChart2, FiSettings, FiUser, FiLogOut, FiZap,
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/tasks', label: 'Tasks', icon: FiCheckSquare },
  { to: '/team', label: 'Team', icon: FiUsers },
  { to: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/settings', label: 'Settings', icon: FiSettings },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

export default function Sidebar({ onNavigate }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="h-full w-full flex flex-col p-4 gap-4">
      <div className="flex items-center gap-2 px-2 py-2">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-900 via-brand-600 to-brand-400 grid place-items-center shadow-glow">
          <FiZap className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-base leading-tight">WorkPulse</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">workspace</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative
               ${isActive
                 ? 'text-white bg-gradient-to-r from-brand-900/90 to-brand-600/90 shadow-glow'
                 : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/5'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-900/90 to-brand-600/90 -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin/users"
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative
               ${isActive
                 ? 'text-white bg-gradient-to-r from-brand-900/90 to-brand-600/90 shadow-glow'
                 : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/5'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-900/90 to-brand-600/90 -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <FiUsers className="h-4 w-4" />
                <span>Users</span>
              </>
            )}
          </NavLink>
        )}
      </nav>

      <div className="glass rounded-2xl p-3 flex items-center gap-3">
        <Avatar name={user?.name} src={user?.avatar_url} size={10} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{user?.name || 'Member'}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          {user?.role && (
            <span className="inline-block mt-1 text-xs font-semibold rounded bg-brand-100 text-brand-700 px-2 py-0.5">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="h-9 w-9 grid place-items-center rounded-xl hover:bg-brand-200/70 text-brand-700"
        >
          <FiLogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
