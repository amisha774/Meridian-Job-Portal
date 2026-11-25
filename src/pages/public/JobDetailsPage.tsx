import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, CheckCircle2, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import { ApplyModal } from '../../components/ApplyModal';
import { useAuth } from '../../hooks/useAuth';
import { jobsApi, savedJobsApi } from '../../services/api';
import { Job } from '../../types';
import {
  extractErrorMessage,
  formatDate,
  formatSalary,
  getInitials,
} from '../../utils/formatters';

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    jobsApi
      .getById(id)
      .then(({ data }) => {
        setJob(data.job);
        setIsSaved(data.meta.isSaved);
        setHasApplied(data.meta.hasApplied);
      })
      .catch((err) => {
        setError(extractErrorMessage(err, 'Job listing not found.'));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save jobs.');
      navigate('/login');
      return;
    }
    if (user?.role !== 'jobseeker') {
      toast.error('Only candidate accounts can bookmark jobs.');
      return;
    }
    try {
      const { data } = await savedJobsApi.toggle(job!._id);
      setIsSaved(data.saved);
      toast.success(data.message);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast.error('Sign in or create a candidate account to apply.');
      navigate('/login');
      return;
    }
    if (user?.role !== 'jobseeker') {
      toast.error('Switch to a Job Seeker account to submit job applications.');
      return;
    }
    setApplyOpen(true);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim() || !job) return;
    setReporting(true);
    try {
      const { data } = await jobsApi.report(job._id, reportReason.trim());
      toast.success(data.message);
      setReportOpen(false);
      setReportReason('');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-8 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="mt-6 h-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Role Unavailable</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {error || 'This job listing may have been removed.'}
        </p>
        <Link
          to="/jobs"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white"
        >
          Back to All Jobs
        </Link>
      </div>
    );
  }

  const company = typeof job.company === 'object' ? job.company : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to all jobs</span>
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                {company?.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    referrerPolicy="no-referrer"
                    className="h-14 w-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-display text-base font-bold">
                    {getInitials(company?.name)}
                  </div>
                )}
                <div>
                  <Link
                    to={company ? `/companies/${company._id}` : '/companies'}
                    className="text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    {company?.name || 'Verified Employer'}
                  </Link>
                  <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    {job.title}
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {job.location} · {job.workMode} · {job.jobType} · {job.experience}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleSave}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                    isSaved
                      ? 'border-blue-700 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                {hasApplied ? (
                  <Link
                    to="/seeker/applications"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-5 py-2 text-sm font-medium text-white"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Applied</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyClick}
                    disabled={job.status !== 'active'}
                    className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {job.status === 'active' ? 'Apply Now' : 'Role Closed'}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-y border-slate-200 dark:border-slate-800 py-5 sm:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Compensation</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                  {formatSalary(job.salary)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Category</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {job.category}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Openings</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                  {job.vacancies} {job.vacancies === 1 ? 'vacancy' : 'vacancies'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Apply Before</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                  {formatDate(job.deadline)}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-7">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Role Overview
                </h2>
                <p className="mt-2.5 whitespace-pre-line text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {job.description}
                </p>
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                    Qualifications & Requirements
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
                    {job.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                    Benefits & Perks
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
                    {job.benefits.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.skills && job.skills.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                    Required Skills
                  </h2>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                    {job.skills.join(' · ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          {company && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                About {company.name}
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {company.industry} · {company.location}
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {company.description}
              </p>
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <p>Team size: {company.size || '50-200 employees'}</p>
                {company.foundedYear && <p>Founded: {company.foundedYear}</p>}
              </div>
              <Link
                to={`/companies/${company._id}`}
                className="mt-5 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 text-center text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                View Company Profile
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              {!reportOpen ? (
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Flag className="h-3.5 w-3.5" />
                  <span>Report inappropriate listing</span>
                </button>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-3">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Report Listing
                  </p>
                  <textarea
                    rows={3}
                    required
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Describe why this listing violates platform standards..."
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReportOpen(false)}
                      className="rounded-lg px-3 py-1.5 text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reporting}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                    >
                      {reporting ? 'Sending...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </aside>
      </div>

      {job && (
        <ApplyModal
          job={job}
          isOpen={applyOpen}
          onClose={() => setApplyOpen(false)}
          onSuccess={() => setHasApplied(true)}
        />
      )}
    </div>
  );
};
