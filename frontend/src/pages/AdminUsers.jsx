import { useEffect, useState } from 'react';
import { usersApi } from '../api/users';
import { useAuthStore } from '../store/authStore';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const current = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!current) return;
    if (current.role !== 'admin') return;
    setLoading(true);
    usersApi.list().then((u) => setUsers(u)).finally(() => setLoading(false));
  }, [current]);

  if (!current || current.role !== 'admin') {
    return <div className="p-6">You do not have permission to view this page.</div>;
  }

  const handleSetRole = async (id, role) => {
    await usersApi.setRole(id, role);
    const u = await usersApi.list();
    setUsers(u);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await usersApi.delete(id);
    setUsers((s) => s.filter((x) => x.id !== id));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Registered users</h2>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="glass rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{u.name} <span className="text-xs text-slate-500">({u.email})</span></div>
                <div className="text-xs text-slate-500">Role: {u.role}</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={u.role}
                  onChange={(e) => handleSetRole(u.id, e.target.value)}
                  className="input w-auto"
                >
                  <option value="admin">admin</option>
                  <option value="manager">manager</option>
                  <option value="member">member</option>
                </select>
                <button onClick={() => handleDelete(u.id)} className="btn-ghost">Offboard</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
