import React, { useEffect, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { adminApi } from '../../services/api';
import { Application } from '../../types';
import { APPLICATION_STATUS_META, formatDate } from '../../utils/formatters';

export const AdminApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .applications()
      .then(({ data }) => setApplications(data.applications))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Platform Applications
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Audit all candidate applications across employers and review stages.
        </p>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : applications.length === 0 ? (
        <EmptyState title="No applications recorded" description="Submitted applications will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3">Role & Employer</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {applications.map((app) => {
                const candidate = typeof app.applicant === 'object' ? app.applicant : null;
                const companyName =
                  typeof app.job?.company === 'object' ? app.job.company.name : 'Employer';
                const meta = APPLICATION_STATUS_META[app.status];
                return (
                  <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <p className="font-medium">{candidate?.fullName || 'Candidate'}</p>
                      <p className="text-xs text-slate-500">{candidate?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{app.job?.title}</p>
                      <p className="text-xs text-slate-500">{companyName}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold ${meta.textClass}`}>{meta.label}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 tabular-nums">
                      {formatDate(app.createdAt)}
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
