import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiUsers, FiMail, FiTrash2, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { teamsApi } from '../api/teams';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { formatRelative } from '../utils/date';

export default function Team() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await teamsApi.list();
      setTeams(data);
      if (!selectedId && data.length) setSelectedId(data[0].id);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!selectedId) return;
    teamsApi.get(selectedId).then(setSelected).catch(() => setSelected(null));
  }, [selectedId]);

  const createTeam = async (e) => {
    e.preventDefault();
    try {
      const created = await teamsApi.create(createForm);
      toast.success('Team created');
      setCreateOpen(false);
      setCreateForm({ name: '', description: '' });
      setTeams((arr) => [created, ...arr]);
      setSelectedId(created.id);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    }
  };

  const invite = async (e) => {
    e.preventDefault();
    if (!selectedId || !inviteEmail) return;
    try {
      await teamsApi.invite(selectedId, inviteEmail);
      toast.success('Member added');
      setInviteEmail('');
      const updated = await teamsApi.get(selectedId);
      setSelected(updated);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invite failed');
    }
  };

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await teamsApi.removeMember(selectedId, userId);
      toast.success('Member removed');
      const updated = await teamsApi.get(selectedId);
      setSelected(updated);
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-sm text-slate-500 mt-1">Collaborate with your crew.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><FiPlus className="h-4 w-4" /> New Team</Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)
          ) : teams.length === 0 ? (
            <EmptyState
              icon={FiUsers}
              title="No teams yet"
              description="Create a team to start collaborating."
              action={<Button onClick={() => setCreateOpen(true)}><FiPlus className="h-4 w-4" /> New Team</Button>}
            />
          ) : (
            teams.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left card p-4 transition-all ${selectedId === t.id ? 'ring-2 ring-brand-500/40 shadow-glow' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{t.name}</p>
                  <Badge tone="indigo">{t.member_count}</Badge>
                </div>
                {t.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>}
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-bold text-xl">{selected.name}</h2>
                  {selected.description && <p className="text-sm text-slate-500 mt-1">{selected.description}</p>}
                </div>
              </div>

              <form onSubmit={invite} className="flex gap-2 mb-5">
                <div className="flex-1">
                  <Input
                    icon={FiMail}
                    placeholder="Invite by email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    type="email"
                  />
                </div>
                <Button type="submit"><FiUserPlus className="h-4 w-4" /> Invite</Button>
              </form>

              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Members ({selected.members?.length || 0})</p>
              <ul className="divide-y divide-white/5">
                {selected.members?.map((m) => (
                  <li key={m.id} className="py-3 flex items-center gap-3">
                    <Avatar name={m.name} src={m.avatar_url} size={10} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{m.name}</p>
                      <p className="text-xs text-slate-500 truncate">{m.email}</p>
                    </div>
                    <Badge tone={m.role === 'owner' ? 'amber' : m.role === 'admin' ? 'purple' : 'slate'}>{m.role}</Badge>
                    <span className="text-xs text-slate-400 hidden md:inline">{formatRelative(m.joined_at)}</span>
                    {m.role !== 'owner' && (
                      <button
                        onClick={() => removeMember(m.id)}
                        className="h-8 w-8 grid place-items-center rounded-lg hover:bg-brand-200/70 text-brand-700"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            !loading && (
              <Card>
                <EmptyState icon={FiUsers} title="Select a team" description="Pick a team on the left to manage members." />
              </Card>
            )
          )}
        </div>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Team">
        <form onSubmit={createTeam} className="space-y-4">
          <Input label="Team name" required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
          <label className="block">
            <span className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Description</span>
            <textarea
              rows={3}
              className="input resize-y"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
