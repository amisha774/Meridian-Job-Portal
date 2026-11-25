import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ExternalLink } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { applicationsApi } from '../../services/api';
import { Application } from '../../types';
import { formatDateTime } from '../../utils/formatters';

export const InterviewManagementPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsApi
      .recruiterApplications({ status: 'interview' })
      .then(({ data }) => setInterviews(data.applications))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Interview Schedule
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage upcoming candidate interviews and access meeting links.
        </p>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : interviews.length === 0 ? (
        <EmptyState
          title="No interviews scheduled yet"
          description="Open the Applicants pipeline to shortlist candidates and schedule interview slots."
          actionLabel="View Applicants"
          actionTo="/recruiter/applicants"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {interviews.map((app) => {
            const candidate = typeof app.applicant === 'object' ? app.applicant : null;
            return (
              <div
                key={app._id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                      {candidate?.fullName || 'Candidate'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {app.job?.title} · {app.interviewMode || 'Video'} Interview
                    </p>
                  </div>
                  <Link
                    to={`/recruiter/applicants/${app._id}`}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Manage
                  </Link>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300 tabular-nums">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(app.interviewDate)}</span>
                </div>

                {app.interviewLink && (
                  <a
                    href={app.interviewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    <span>Open Meeting Room</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
