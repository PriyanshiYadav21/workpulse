import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiSun, FiMoon, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useThemeStore } from '../store/themeStore';
import { usersApi } from '../api/users';

export default function Settings() {
  const { theme, toggle } = useThemeStore();
  const [pwd, setPwd] = useState({ current_password: '', new_password: '' });
  const [saving, setSaving] = useState(false);

  const submitPwd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersApi.changePassword(pwd);
      toast.success('Password updated');
      setPwd({ current_password: '', new_password: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your workspace preferences.</p>
      </motion.div>

      <Card>
        <h2 className="font-semibold mb-4">Appearance</h2>
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/40 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-900 to-brand-500 grid place-items-center text-white">
              {theme === 'dark' ? <FiMoon className="h-4 w-4" /> : <FiSun className="h-4 w-4" />}
            </div>
            <div>
              <p className="font-medium capitalize">{theme} Mode</p>
              <p className="text-xs text-slate-500">Switch between light and dark themes.</p>
            </div>
          </div>
          <Button variant="ghost" onClick={toggle}>Toggle</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold mb-4 inline-flex items-center gap-2"><FiLock className="h-4 w-4" /> Change Password</h2>
        <form onSubmit={submitPwd} className="space-y-4 max-w-md">
          <Input
            label="Current password" type="password" required
            value={pwd.current_password}
            onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })}
          />
          <Input
            label="New password" type="password" required minLength={6}
            value={pwd.new_password}
            onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })}
          />
          <Button type="submit" disabled={saving}>
            <FiCheck className="h-4 w-4" /> {saving ? 'Saving...' : 'Update Password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
