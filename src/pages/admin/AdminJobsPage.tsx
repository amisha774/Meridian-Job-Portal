import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { adminApi } from '../../services/api';
import { Job } from '../../types';
import { extractErrorMessage, formatDate, JOB_STATUS_META } from '../../utils/formatters';

export const AdminJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState('all');
  const [reportedOnly, setReportedOnly] = useState(false);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi
      .jobs({
        status: status !== 'all' ? status : undefined,
        reported: reportedOnly ? 'true' : undefined,
        q: q || undefined,
      })
      .then(({ data }) => setJobs(data.jobs))
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [status, reportedOnly, q]);

  const handleStatusChange = async (jobId: string, nextStatus: string) => {
    try {
      const { data } = await adminApi.updateJobStatus(jobId, nextStatus);
      setJobs((prev) => prev.map((j) => (j._id === jobId ? data.job : j)));
      toast.success(data.message);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDelete = async (jobId: string) => {
    try {
      const { data } = await adminApi.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      toast.success(data.message);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Manage Job Postings
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Review active listings, inspect user-reported jobs, and remove inappropriate postings.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search job title, category, or city..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-3 text-sm"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter jobs by status"
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="flagged">Flagged</option>
          <option value="closed">Closed</option>
        </select>

        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm">
          <input
            type="checkbox"
            checked={reportedOnly}
            onChange={(e) => setReportedOnly(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          <span>Reported only</span>
        </label>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No matching job listings"
          description="No job postings match the current moderation filters."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Listing</th>
                <th className="px-5 py-3">Recruiter</th>
                <th className="px-5 py-3">Reports</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {jobs.map((job) => {
                const statusMeta = JOB_STATUS_META[job.status];
                const recruiterName =
                  typeof job.recruiter === 'object' ? job.recruiter.fullName : 'Recruiter';
                const companyName =
                  typeof job.company === 'object' ? job.company.name : 'Company';
                return (
                  <tr key={job._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="font-medium text-slate-900 dark:text-white hover:text-blue-700"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {companyName} · {formatDate(job.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400">
                      {recruiterName}
                    </td>
                    <td className="px-5 py-4 text-xs tabular-nums">
                      {job.reports?.length ? (
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {job.reports.length} report(s)
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold ${statusMeta.textClass}`}>
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {job.status !== 'active' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(job._id, 'active')}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(job._id)}
                          aria-label={`Remove ${job.title}`}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
