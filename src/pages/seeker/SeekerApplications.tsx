import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ExternalLink, FileText, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { applicationsApi } from '../../services/api';
import { Application } from '../../types';
import {
  APPLICATION_STATUS_META,
  extractErrorMessage,
  formatDate,
  formatDateTime,
} from '../../utils/formatters';

export const SeekerApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadApplications = () => {
    setLoading(true);
    applicationsApi
      .myApplications()
      .then(({ data }) => setApplications(data.applications))
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleWithdraw = async (id: string) => {
    try {
      await applicationsApi.withdraw(id);
      setApplications((prev) => prev.filter((a) => a._id !== id));
      toast.success('Application withdrawn.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const filtered = applications.filter((app) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const title = app.job?.title?.toLowerCase() || '';
      const company =
        typeof app.job?.company === 'object' ? app.job.company.name.toLowerCase() : '';
      return title.includes(q) || company.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          My Applications
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Monitor live status updates, scheduled interviews, and submitted resumes.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by job title or company..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-3 text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter applications by status"
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="reviewed">Reviewed</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview Scheduled</option>
          <option value="hired">Offer / Hired</option>
          <option value="rejected">Not Selected</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No applications match your filter"
          description="Explore active job listings to submit new applications or clear your current filters."
          actionLabel="Browse Open Jobs"
          actionTo="/jobs"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const meta = APPLICATION_STATUS_META[app.status];
            const companyName =
              typeof app.job?.company === 'object' ? app.job.company.name : 'Employer';

            return (
              <div
                key={app._id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Link
                      to={`/jobs/${app.job?._id}`}
                      className="font-display text-base font-semibold text-slate-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-400"
                    >
                      {app.job?.title || 'Job Listing'}
                    </Link>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${meta.bgClass} ${meta.textClass}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {companyName} · {app.job?.location} · Applied {formatDate(app.createdAt)}
                  </p>

                  {app.status === 'interview' && app.interviewDate && (
                    <div className="mt-2 inline-flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
                      <span className="inline-flex items-center gap-1.5 font-medium tabular-nums">
                        <Calendar className="h-3.5 w-3.5" />
                        {app.interviewMode || 'Video'} Interview: {formatDateTime(app.interviewDate)}
                      </span>
                      {app.interviewLink && (
                        <a
                          href={app.interviewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-400 hover:underline"
                        >
                          <span>Join Link</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {app.resume?.url && (
                    <a
                      href={app.resume.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Resume PDF</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleWithdraw(app._id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
