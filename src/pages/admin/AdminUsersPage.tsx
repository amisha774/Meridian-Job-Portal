import React, { useEffect, useState } from 'react';
import { Ban, CheckCircle2, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { adminApi } from '../../services/api';
import { User } from '../../types';
import { extractErrorMessage, formatDate } from '../../utils/formatters';

interface AdminUsersPageProps {
  defaultRole?: 'all' | 'recruiter' | 'jobseeker';
  title?: string;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({
  defaultRole = 'all',
  title = 'Manage Users',
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<string>(defaultRole);
  const [status, setStatus] = useState<string>('all');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRole(defaultRole);
  }, [defaultRole]);

  useEffect(() => {
    setLoading(true);
    adminApi
      .users({
        role: role !== 'all' ? role : undefined,
        status: status !== 'all' ? status : undefined,
        q: q || undefined,
      })
      .then(({ data }) => setUsers(data.users))
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [role, status, q]);

  const handleToggleStatus = async (user: User) => {
    try {
      const { data } = await adminApi.toggleUserStatus(user._id);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? data.user : u)));
      toast.success(data.message);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const { data } = await adminApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success(data.message);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Inspect user accounts, suspend policy violators, or restore account access.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        <div className="relative sm:col-span-6">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, or city..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-3 text-sm"
          />
        </div>
        <div className="sm:col-span-3">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-label="Filter by role"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm"
          >
            <option value="all">All Roles</option>
            <option value="jobseeker">Job Seekers</option>
            <option value="recruiter">Recruiters</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        <div className="sm:col-span-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by account status"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="No accounts match your current filter selection."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Account State</th>
                <th className="px-5 py-3 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900 dark:text-white">{u.fullName}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium capitalize">{u.role}</td>
                  <td className="px-5 py-4 text-xs text-slate-500 tabular-nums">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-semibold ${
                        u.isActive
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {u.isActive ? (
                          <>
                            <Ban className="h-3.5 w-3.5 text-amber-600" />
                            <span>Block</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u._id)}
                        aria-label={`Delete ${u.fullName}`}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
