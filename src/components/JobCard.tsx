import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowUpRight } from 'lucide-react';
import { Job } from '../types';
import { formatRelativeTime, formatSalary, getInitials } from '../utils/formatters';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
  showMatchScore?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved = false,
  onToggleSave,
  showMatchScore = false,
}) => {
  const company = typeof job.company === 'object' ? job.company : null;
  const companyName = company?.name || 'Verified Employer';
  const companyLogo = company?.logo;

  return (
    <article className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-colors hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                referrerPolicy="no-referrer"
                className="h-11 w-11 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
              />
            ) : (
              <div className="h-11 w-11 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-display text-sm font-bold text-slate-700 dark:text-slate-200 shrink-0">
                {getInitials(companyName)}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                {companyName}
              </p>
              <Link
                to={`/jobs/${job._id}`}
                className="mt-0.5 block font-display text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-snug"
              >
                {job.title}
              </Link>
            </div>
          </div>

          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(job._id)}
              aria-label={isSaved ? 'Remove saved job' : 'Save job'}
              className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                isSaved
                  ? 'border-blue-700 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span>{job.location}</span>
          <span aria-hidden="true">·</span>
          <span>{job.workMode}</span>
          <span aria-hidden="true">·</span>
          <span>{job.jobType}</span>
          <span aria-hidden="true">·</span>
          <span>{job.experience}</span>
        </div>

        {job.skills && job.skills.length > 0 && (
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 truncate">
            {job.skills.slice(0, 5).join(' · ')}
          </p>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatSalary(job.salary)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {showMatchScore && typeof job.matchScore === 'number'
              ? `${job.matchScore}% skill match`
              : `Posted ${formatRelativeTime(job.createdAt)}`}
          </p>
        </div>

        <Link
          to={`/jobs/${job._id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          <span>View Role</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
};
