import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { JobCard } from '../../components/JobCard';
import { companiesApi } from '../../services/api';
import { Company, Job } from '../../types';
import { getInitials } from '../../utils/formatters';

export const CompanyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    companiesApi
      .getById(id)
      .then(({ data }) => {
        setCompany(data.company);
        setJobs(data.jobs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-64 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Company Not Found</h1>
        <Link to="/companies" className="mt-4 inline-block text-sm text-blue-700 hover:underline">
          Return to Companies
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/companies"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>All companies</span>
      </Link>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="h-48 sm:h-60 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            src={company.banner || '/src/assets/images/company_campus_banner_1795108889735.jpg'}
            alt={`${company.name} campus`}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-display text-lg font-bold">
                  {getInitials(company.name)}
                </div>
              )}
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                  {company.name}
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {company.industry} · {company.location} · {company.size || 'Growing team'}
                </p>
              </div>
            </div>

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                <span>Company Website</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <p className="mt-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
            {company.description}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          Open Positions at {company.name} ({jobs.length})
        </h2>
        <div className="mt-5">
          {jobs.length === 0 ? (
            <EmptyState
              title="No active openings right now"
              description="Check back soon or browse similar teams across Meridian."
              actionLabel="Browse All Jobs"
              actionTo="/jobs"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
