import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiZap, FiCheckCircle, FiUsers, FiBarChart2, FiArrowRight, FiLayers, FiShield,
} from 'react-icons/fi';
import ThemeToggle from '../components/common/ThemeToggle';

const FEATURES = [
  { icon: FiLayers, title: 'Kanban that flows', text: 'Drag, drop, and reprioritize in real-time.' },
  { icon: FiUsers, title: 'Built for teams', text: 'Roles, invites, comments, and live activity feeds.' },
  { icon: FiBarChart2, title: 'Insightful analytics', text: 'Charts and breakdowns that actually drive decisions.' },
  { icon: FiShield, title: 'Secure by default', text: 'JWT auth, bcrypt password hashing, rate limiting.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-aurora opacity-90 pointer-events-none" />
      <div
        className="absolute inset-0 bg-grid-light dark:bg-grid-dark bg-[size:48px_48px] opacity-40 pointer-events-none"
        style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)' }}
      />

      <header className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-900 via-brand-600 to-brand-400 grid place-items-center shadow-glow">
            <FiZap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg">WorkPulse</span>
        </div>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className="btn-ghost">Log in</Link>
          <Link to="/register" className="btn-primary">Sign up</Link>
        </nav>
      </header>

      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-12 md:pt-24 text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium glass mb-6"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-700 animate-pulse" />
          Now in public beta — premium experience for modern teams
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]"
        >
          The task workspace<br />
          <span className="gradient-text">teams actually love</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
        >
          Ship projects faster with a beautiful kanban board, smart analytics, and
          a clean collaboration layer designed for modern product teams.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Link to="/register" className="btn-primary text-base px-6 py-3">
            Sign up <FiArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/login" className="btn-ghost text-base px-6 py-3">Sign in</Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 relative"
        >
          <div className="glass-strong rounded-3xl p-3 shadow-2xl">
            <div className="rounded-2xl bg-gradient-to-br from-[#3d250f] to-[#2a180b] p-6 grid grid-cols-1 md:grid-cols-4 gap-3">
              {['To Do', 'In Progress', 'Review', 'Done'].map((c, i) => (
                <div key={c} className="rounded-xl bg-white/5 backdrop-blur p-3 border border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">{c}</p>
                  {Array.from({ length: 3 - (i % 2) }).map((_, j) => (
                    <div key={j} className="rounded-lg bg-gradient-to-br from-brand-200/60 to-brand-100/60 border border-white/10 p-2.5 mb-2">
                      <div className="h-2 w-2/3 rounded bg-white/30 mb-2" />
                      <div className="h-1.5 w-1/2 rounded bg-white/20" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card p-6"
            >
              <div className="h-10 w-10 rounded-xl grid place-items-center bg-gradient-to-br from-brand-200/60 to-brand-100/60 mb-4">
                <f.icon className="h-5 w-5 text-brand-700" />
              </div>
              <p className="font-semibold">{f.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-sm text-slate-500">
        Built with React, Express & MySQL · WorkPulse {new Date().getFullYear()}
      </footer>
    </div>
  );
}
