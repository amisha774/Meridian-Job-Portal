import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StatCard } from '../../components/StatCard';
import { adminApi } from '../../services/api';
import { AdminDashboardData } from '../../types';
import { formatDate } from '../../utils/formatters';

const CHART_COLORS = ['#1d4ed8', '#0284c7', '#16a34a', '#d97706', '#64748b'];

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .stats()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-sm text-slate-500">Loading platform analytics...</div>;
  }

  const { stats, analytics, recentUsers, recentJobs } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Platform Administration
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Real-time system metrics, marketplace supply/demand, and moderation queue.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Registered Users"
          value={stats.totalUsers}
          helper={`${stats.totalSeekers} seekers · ${stats.totalRecruiters} recruiters`}
        />
        <StatCard label="Verified Companies" value={stats.totalCompanies} />
        <StatCard
          label="Job Postings"
          value={stats.totalJobs}
          helper={`${stats.activeJobs} active · ${stats.flaggedJobs} flagged`}
        />
        <StatCard label="Total Applications" value={stats.totalApplications} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Jobs by Discipline
          </h2>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.jobsByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Account Role Distribution
          </h2>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.userBreakdown}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {analytics.userBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Recent Users</h2>
            <Link to="/admin/users" className="text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline">
              Manage all
            </Link>
          </div>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {recentUsers.map((u) => (
              <div key={u._id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{u.fullName}</p>
                  <p className="text-xs text-slate-500">
                    {u.email} · {u.role}
                  </p>
                </div>
                <span className="text-xs text-slate-400 tabular-nums">{formatDate(u.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Latest Job Postings</h2>
            <Link to="/admin/jobs" className="text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline">
              Moderate jobs
            </Link>
          </div>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {recentJobs.map((j) => (
              <div key={j._id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{j.title}</p>
                  <p className="text-xs text-slate-500">
                    {typeof j.company === 'object' ? j.company.name : 'Employer'} · {j.status}
                  </p>
                </div>
                <span className="text-xs text-slate-400 tabular-nums">{formatDate(j.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
