import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate(location.state?.from || '/dashboard');
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      if (serverMsg) {
        toast.error(serverMsg);
      } else if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
        toast.error("Can't reach the backend. Is it running on " + (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '?');
      } else {
        toast.error(err?.message || 'Login failed');
      }
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative overflow-hidden">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark bg-[size:48px_48px] opacity-30" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white/10 grid place-items-center backdrop-blur">
              <FiZap className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg">WorkPulse</span>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative space-y-3 max-w-md"
        >
          <h2 className="text-4xl font-bold leading-tight">Plan less.<br />Ship more.</h2>
          <p className="text-white/80">
            A premium workspace for modern teams. Sign in to manage your tasks,
            collaborate with your team, and track progress with beautiful analytics.
          </p>
        </motion.div>
        <p className="relative text-xs text-white/60">© {new Date().getFullYear()} WorkPulse</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 lg:hidden mb-6">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-900 via-brand-600 to-brand-400 grid place-items-center">
                <FiZap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">WorkPulse</span>
            </Link>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-slate-500 mt-2">Sign in to your workspace</p>
          </div>

          <form onSubmit={submit} className="space-y-4" autoComplete="off">
            <Input
              label="Email"
              name="email"
              type="email"
              icon={FiMail}
              required
              autoFocus
              autoComplete="username"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              icon={FiLock}
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:underline">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
