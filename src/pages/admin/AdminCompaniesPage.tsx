import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { adminApi, companiesApi } from '../../services/api';
import { Company } from '../../types';
import { extractErrorMessage, formatDate } from '../../utils/formatters';

export const AdminCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .companies()
      .then(({ data }) => setCompanies(data.companies))
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await companiesApi.remove(id);
      setCompanies((prev) => prev.filter((c) => c._id !== id));
      toast.success('Company removed.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Manage Companies
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Review registered employer profiles and owning recruiter accounts.
        </p>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : companies.length === 0 ? (
        <EmptyState title="No companies registered" description="Registered employer profiles will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Industry & Location</th>
                <th className="px-5 py-3">Recruiter Owner</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {companies.map((c) => {
                const owner = typeof c.recruiter === 'object' ? c.recruiter : null;
                return (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <Link
                        to={`/companies/${c._id}`}
                        className="font-medium text-slate-900 dark:text-white hover:text-blue-700"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400">
                      {c.industry} · {c.location}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400">
                      {owner ? `${owner.fullName} (${owner.email})` : '—'}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 tabular-nums">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(c._id)}
                        aria-label={`Delete ${c.name}`}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
