import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      toast.success('Welcome to WorkPulse!');
      navigate('/dashboard');
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      const zodErr = err?.response?.data?.errors;
      if (serverMsg) {
        toast.error(serverMsg);
      } else if (zodErr) {
        const first = zodErr.fieldErrors
          ? Object.values(zodErr.fieldErrors).flat()[0]
          : null;
        toast.error(first || 'Validation error');
      } else if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
        toast.error("Can't reach the backend. Is it running on " + (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '?');
      } else {
        toast.error(err?.message || 'Sign up failed');
      }
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative overflow-hidden">
      <div className="flex items-center justify-center p-6 md:p-12 order-2 lg:order-1">
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
            <h1 className="text-3xl font-bold">Create your workspace</h1>
            <p className="text-slate-500 mt-2">Free to start. No credit card.</p>
          </div>

          <form onSubmit={submit} className="space-y-4" autoComplete="off">
            <Input
              label="Full name"
              name="name"
              icon={FiUser}
              required
              autoFocus
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              icon={FiMail}
              required
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
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                className="input"
                name="role"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                required
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="member">Member</option>
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex order-1 lg:order-2 flex-col justify-between p-12 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark bg-[size:48px_48px] opacity-30" />
        <div className="relative flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-white/10 grid place-items-center backdrop-blur">
            <FiZap className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg">WorkPulse</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative space-y-3 max-w-md"
        >
          <h2 className="text-4xl font-bold leading-tight">Where work feels lighter.</h2>
          <p className="text-white/80">
            Join thousands of teams using WorkPulse to plan, build, and ship — with
            an experience that's been crafted, not just engineered.
          </p>
        </motion.div>
        <p className="relative text-xs text-white/60">© {new Date().getFullYear()} WorkPulse</p>
      </div>
    </div>
  );
}
