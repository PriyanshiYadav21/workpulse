import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { usersApi } from '../api/users';

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [form, setForm] = useState({ name: '', bio: '', avatar_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await usersApi.updateProfile(form);
      updateUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">How others see you on WorkPulse.</p>
      </motion.div>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={form.name || user?.name} src={form.avatar_url} size={20} className="h-20 w-20 text-2xl" />
          <div>
            <p className="font-bold text-lg">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs uppercase tracking-wider text-brand-700 font-semibold mt-1">{user?.role}</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 max-w-md">
          <Input
            label="Full name" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Avatar URL" value={form.avatar_url}
            onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
            placeholder="https://..."
          />
          <label className="block">
            <span className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Bio</span>
            <textarea
              rows={4}
              className="input resize-y"
              maxLength={500}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell your team a little about yourself..."
            />
          </label>
          <Button type="submit" disabled={saving}>
            <FiSave className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
