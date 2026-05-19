import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiZap } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6">
      <div className="absolute inset-0 bg-aurora opacity-80 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center max-w-lg"
      >
        <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 grid place-items-center shadow-glow mb-6">
          <FiZap className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-7xl md:text-9xl font-extrabold gradient-text leading-none">404</h1>
        <p className="mt-4 text-xl font-semibold">This page took a detour.</p>
        <p className="mt-2 text-slate-500">
          We couldn't find what you were looking for. Maybe head back to your dashboard?
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link to="/" className="btn-ghost"><FiArrowLeft className="h-4 w-4" /> Landing</Link>
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
      </motion.div>
    </div>
  );
}
