import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileCheck2 } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { JobCard } from '../../components/JobCard';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { applicationsApi, jobsApi, savedJobsApi } from '../../services/api';
import { Application, Job } from '../../types';
import { APPLICATION_STATUS_META, formatDate } from '../../utils/formatters';

export const SeekerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommended, setRecommended] = useState<Job[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      applicationsApi.myApplications(),
      jobsApi.recommendations(),
      savedJobsApi.list(),
    ])
      .then(([appRes, recRes, savedRes]) => {
        setApplications(appRes.data.applications);
        setRecommended(recRes.data.jobs);
        setSavedCount(savedRes.data.savedJobs.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const interviewsCount = applications.filter((a) => a.status === 'interview').length;
  const shortlistedCount = applications.filter((a) =>
    ['shortlisted', 'interview', 'hired'].includes(a.status)
  ).length;
  const resumeScore = user?.resume?.analysis?.score;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.fullName?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track active applications, review resume readiness, and explore skill-matched roles.
          </p>
        </div>

        <Link
          to="/seeker/profile"
          className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
        >
          Update Profile & Resume
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Submitted Applications" value={applications.length} />
        <StatCard label="Shortlisted & Interviews" value={shortlistedCount} helper={`${interviewsCount} scheduled`} />
        <StatCard label="Saved Positions" value={savedCount} />
        <StatCard
          label="Resume Readiness"
          value={resumeScore ? `${resumeScore}/100` : 'No PDF'}
          helper={
            user?.resume?.analysis?.detectedSkills?.length
              ? `${user.resume.analysis.detectedSkills.length} skills verified`
              : 'Upload PDF in Profile'
          }
        />
      </div>

      {/* Recent Applications */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Recent Applications
          </h2>
          <Link
            to="/seeker/applications"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline"
          >
            <span>All applications</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={2} />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications submitted yet"
            description="Browse verified openings and submit your resume to track progress in real time."
            actionLabel="Browse Open Jobs"
            actionTo="/jobs"
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Role & Company</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Applied Date</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {applications.slice(0, 5).map((app) => {
                  const statusMeta = APPLICATION_STATUS_META[app.status];
                  const companyName =
                    typeof app.job?.company === 'object' ? app.job.company.name : 'Employer';
                  return (
                    <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {app.job?.title || 'Job Listing'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {companyName} · {app.job?.location}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold ${statusMeta.textClass}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to="/seeker/applications"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline"
                        >
                          <FileCheck2 className="h-3.5 w-3.5" />
                          <span>Details</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recommended Jobs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Recommended for Your Skill Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked using your listed profile skills and uploaded PDF resume keywords.
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline"
          >
            <span>Explore all</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {recommended.slice(0, 4).map((job) => (
              <JobCard key={job._id} job={job} showMatchScore />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
