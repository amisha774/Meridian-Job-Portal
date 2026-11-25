import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EmptyState } from '../../components/EmptyState';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { applicationsApi, companiesApi, jobsApi } from '../../services/api';
import { Application, Company, Job } from '../../types';
import { APPLICATION_STATUS_META, formatDate } from '../../utils/formatters';

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      jobsApi.myJobs(),
      applicationsApi.recruiterApplications(),
      companiesApi.myCompanies(),
    ])
      .then(([jobsRes, appsRes, compRes]) => {
        setJobs(jobsRes.data.jobs);
        setApplications(appsRes.data.applications);
        setCompanies(compRes.data.companies);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const interviews = applications.filter((a) => a.status === 'interview').length;
  const shortlisted = applications.filter((a) => a.status === 'shortlisted').length;

  const pipelineData = [
    { stage: 'Pending', count: applications.filter((a) => a.status === 'pending').length },
    { stage: 'Reviewed', count: applications.filter((a) => a.status === 'reviewed').length },
    { stage: 'Shortlisted', count: shortlisted },
    { stage: 'Interview', count: interviews },
    { stage: 'Hired', count: applications.filter((a) => a.status === 'hired').length },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Recruiting Overview
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Welcome, {user?.fullName}. Monitor active roles, applicant pipelines, and upcoming interviews.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {companies.length === 0 && (
            <Link
              to="/recruiter/company"
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Setup Company
            </Link>
          )}
          <Link
            to="/recruiter/jobs/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>Post New Job</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Posted Jobs" value={jobs.length} helper={`${activeJobs} currently active`} />
        <StatCard label="Total Applicants" value={applications.length} />
        <StatCard label="Shortlisted" value={shortlisted} />
        <StatCard label="Interviews Scheduled" value={interviews} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Applicant Pipeline Breakdown
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Candidate distribution across review stages
          </p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Recent Candidate Applications
            </h2>
            <Link
              to="/recruiter/applicants"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline"
            >
              <span>Manage all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 flex-1">
            {loading ? (
              <p className="text-sm text-slate-500 py-8 text-center">Loading applicants...</p>
            ) : applications.length === 0 ? (
              <EmptyState
                title="No applications received yet"
                description="Publish an active job posting to start receiving candidate profiles and PDF resumes."
                actionLabel="Post a Job"
                actionTo="/recruiter/jobs/new"
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {applications.slice(0, 5).map((app) => {
                  const applicantName =
                    typeof app.applicant === 'object' ? app.applicant.fullName : 'Candidate';
                  const meta = APPLICATION_STATUS_META[app.status];
                  return (
                    <div
                      key={app._id}
                      className="flex items-center justify-between gap-3 py-3.5"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/recruiter/applicants/${app._id}`}
                          className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-400 truncate block"
                        >
                          {applicantName}
                        </Link>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {app.job?.title} · {formatDate(app.createdAt)}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold whitespace-nowrap ${meta.textClass}`}>
                        {meta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
