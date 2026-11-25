import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, FileText, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { applicationsApi, jobsApi } from '../../services/api';
import { Application, ApplicationStatus, Job } from '../../types';
import {
  APPLICATION_STATUS_META,
  extractErrorMessage,
  formatDate,
} from '../../utils/formatters';

export const ApplicantsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobFilter, setJobFilter] = useState(searchParams.get('jobId') || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [scheduleApp, setScheduleApp] = useState<Application | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewMode, setInterviewMode] = useState<'Video' | 'Phone' | 'On-site'>('Video');
  const [interviewLink, setInterviewLink] = useState('');
  const [savingInterview, setSavingInterview] = useState(false);

  useEffect(() => {
    Promise.all([
      applicationsApi.recruiterApplications({
        jobId: jobFilter !== 'all' ? jobFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
      jobsApi.myJobs(),
    ])
      .then(([appRes, jobRes]) => {
        setApplications(appRes.data.applications);
        setJobs(jobRes.data.jobs);
      })
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [jobFilter, statusFilter]);

  const updateStatus = async (appId: string, status: ApplicationStatus) => {
    try {
      await applicationsApi.updateStatus(appId, { status });
      setApplications((prev) => prev.map((a) => (a._id === appId ? { ...a, status } : a)));
      toast.success(`Candidate marked ${status}.`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleApp || !interviewDate) return;
    setSavingInterview(true);
    try {
      const { data } = await applicationsApi.updateStatus(scheduleApp._id, {
        status: 'interview',
        interviewDate,
        interviewMode,
        interviewLink,
      });
      setApplications((prev) =>
        prev.map((a) =>
          a._id === scheduleApp._id
            ? {
                ...a,
                status: 'interview',
                interviewDate: data.application.interviewDate,
                interviewMode: data.application.interviewMode,
                interviewLink: data.application.interviewLink,
              }
            : a
        )
      );
      toast.success('Interview scheduled and candidate notified.');
      setScheduleApp(null);
      setInterviewDate('');
      setInterviewLink('');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSavingInterview(false);
    }
  };

  const filtered = applications.filter((app) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = typeof app.applicant === 'object' ? app.applicant.fullName.toLowerCase() : '';
    const title = app.job?.title?.toLowerCase() || '';
    return name.includes(q) || title.includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Applicant Pipeline
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Review candidate resumes, shortlist applicants, and coordinate technical interviews.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        <div className="relative sm:col-span-5">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate or role..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-3 text-sm"
          />
        </div>
        <div className="sm:col-span-4">
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            aria-label="Filter by job"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm"
          >
            <option value="all">All Posted Jobs</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm"
          >
            <option value="all">All Stages</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No applicants found"
          description="No candidate submissions match the selected role or stage filters."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Applied Role</th>
                <th className="px-5 py-3">Applied</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.map((app) => {
                const candidate = typeof app.applicant === 'object' ? app.applicant : null;
                const meta = APPLICATION_STATUS_META[app.status];
                return (
                  <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <Link
                        to={`/recruiter/applicants/${app._id}`}
                        className="font-medium text-slate-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-400"
                      >
                        {candidate?.fullName || 'Candidate'}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {candidate?.headline || candidate?.email}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {app.job?.title}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 tabular-nums">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          updateStatus(app._id, e.target.value as ApplicationStatus)
                        }
                        aria-label={`Update status for ${candidate?.fullName}`}
                        className={`rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-2 py-1 text-xs font-semibold ${meta.textClass}`}
                      >
                        <option value="pending">Pending Review</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview">Interview</option>
                        <option value="hired">Offer / Hired</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {app.resume?.url && (
                          <a
                            href={app.resume.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Resume</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setScheduleApp(app);
                            setInterviewLink(
                              app.interviewLink || 'https://meet.meridian.io/interview-room'
                            );
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Interview</span>
                        </button>
                        <Link
                          to={`/recruiter/applicants/${app._id}`}
                          className="rounded-lg bg-slate-900 dark:bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-white dark:text-slate-900"
                        >
                          Profile
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {scheduleApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="font-display text-lg font-semibold">Schedule Interview</h2>
              <button
                type="button"
                onClick={() => setScheduleApp(null)}
                className="rounded-lg p-1 text-slate-500 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Interview Mode</label>
                <select
                  value={interviewMode}
                  onChange={(e) =>
                    setInterviewMode(e.target.value as 'Video' | 'Phone' | 'On-site')
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
                >
                  <option value="Video">Video</option>
                  <option value="Phone">Phone</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meeting Link / Address</label>
                <input
                  type="text"
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  placeholder="https://meet.meridian.io/..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScheduleApp(null)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingInterview}
                  className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                >
                  {savingInterview ? 'Scheduling...' : 'Confirm & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
