import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Plus, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { jobsApi } from '../../services/api';
import { Job } from '../../types';
import {
  extractErrorMessage,
  formatDate,
  formatSalary,
  JOB_STATUS_META,
} from '../../utils/formatters';

export const ManageJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi
      .myJobs()
      .then(({ data }) => setJobs(data.jobs))
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (job: Job) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      const { data } = await jobsApi.update(job._id, { status: nextStatus });
      setJobs((prev) => prev.map((j) => (j._id === job._id ? data.job : j)));
      toast.success(`Job marked ${nextStatus}.`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await jobsApi.remove(id);
      setJobs((prev) => prev.filter((j) => j._id !== id));
      toast.success('Job posting deleted.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Manage Posted Jobs
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Edit vacancies, pause hiring, or review candidate submissions per role.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs posted yet"
          description="Create your first job listing to start receiving applications."
          actionLabel="Post New Job"
          actionTo="/recruiter/jobs/new"
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Position</th>
                <th className="px-5 py-3">Compensation</th>
                <th className="px-5 py-3">Applicants</th>
                <th className="px-5 py-3">Deadline</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {jobs.map((job) => {
                const statusMeta = JOB_STATUS_META[job.status];
                return (
                  <tr key={job._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="font-medium text-slate-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-400"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {job.location} · {job.workMode} · {job.jobType}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium tabular-nums">
                      {formatSalary(job.salary)}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        to={`/recruiter/applicants?jobId=${job._id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline tabular-nums"
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>{job.applicantCount}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 tabular-nums">
                      {formatDate(job.deadline)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(job)}
                        className={`text-xs font-semibold hover:underline ${statusMeta.textClass}`}
                      >
                        {statusMeta.label}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/recruiter/jobs/${job._id}/edit`}
                          aria-label={`Edit ${job.title}`}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(job._id)}
                          aria-label={`Delete ${job.title}`}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
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
