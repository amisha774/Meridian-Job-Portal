
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, RotateCcw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmptyState } from '../../components/EmptyState';
import { JobCard } from '../../components/JobCard';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../hooks/useAuth';
import { jobsApi, savedJobsApi } from '../../services/api';
import { Job, PaginationMeta } from '../../types';
import { extractErrorMessage } from '../../utils/formatters';

// Job categories relevant to IT and other local opportunities
const CATEGORIES = [
  'Software Engineering',
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Data Science & AI',
  'DevOps & Cloud',
  'UI/UX Design',
  'Software Testing',
  'Digital Marketing',
  'Human Resources',
];

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Executive'];

export const AllJobsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || 'all');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || 'all');
  const [experience, setExperience] = useState(searchParams.get('experience') || 'all');
  const [salaryMin, setSalaryMin] = useState(searchParams.get('salaryMin') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'featured');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 8,
    pages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await jobsApi.list({
        q: q || undefined,
        location: location || undefined,
        category: category !== 'all' ? category : undefined,
        jobType: jobType !== 'all' ? jobType : undefined,
        workMode: workMode !== 'all' ? workMode : undefined,
        experience: experience !== 'all' ? experience : undefined,
        salaryMin: salaryMin || undefined,
        sort,
        page,
        limit: 8,
      });

      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load job listings.'));
    } finally {
      setLoading(false);
    }
  }, [q, location, category, jobType, workMode, experience, salaryMin, sort, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'jobseeker') {
      setSavedIds(new Set());
      return;
    }

    savedJobsApi
      .list()
      .then(({ data }) => setSavedIds(new Set(data.savedJobs.map((s) => s.job._id))))
      .catch(() => {});
  }, [isAuthenticated, user?.role]);

  const applyFilterResetPage = (updater: () => void) => {
    updater();
    setPage(1);
  };

  const resetAllFilters = () => {
    setQ('');
    setLocation('');
    setCategory('all');
    setJobType('all');
    setWorkMode('all');
    setExperience('all');
    setSalaryMin('');
    setSort('featured');
    setPage(1);
    setSearchParams({});
  };

  const handleToggleSave = async (jobId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in as a candidate to save jobs.');
      navigate('/login');
      return;
    }

    if (user?.role !== 'jobseeker') {
      toast.error('Only candidate accounts can bookmark jobs.');
      return;
    }

    try {
      const { data } = await savedJobsApi.toggle(jobId);

      setSavedIds((prev) => {
        const next = new Set(prev);

        if (data.saved) {
          next.add(jobId);
        } else {
          next.delete(jobId);
        }

        return next;
      });

      toast.success(data.message);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

      {/* Page Heading */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Explore Jobs in Madhya Pradesh
        </h1>

        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
          Find the latest job opportunities in Indore, Bhopal, Gwalior,
          Jabalpur, Ujjain and other locations.
        </p>

        {/* Search Section */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-12">

          <div className="relative sm:col-span-5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={q}
              onChange={(e) =>
                applyFilterResetPage(() => setQ(e.target.value))
              }
              placeholder="Search job title, skills or company..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="relative sm:col-span-4">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={location}
              onChange={(e) =>
                applyFilterResetPage(() => setLocation(e.target.value))
              }
              placeholder="Indore, Bhopal, Gwalior, Remote..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={sort}
              onChange={(e) =>
                applyFilterResetPage(() => setSort(e.target.value))
              }
              aria-label="Sort jobs"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
            >
              <option value="featured">Sort: Featured & Recent</option>
              <option value="newest">Sort: Newest First</option>
              <option value="salary_desc">Sort: Highest Salary</option>
              <option value="salary_asc">Sort: Lowest Salary</option>
              <option value="deadline">Sort: Earliest Deadline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">

        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 space-y-6">

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">

            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Find Your Job
              </h2>

              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Job Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  applyFilterResetPage(() => setCategory(e.target.value))
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Categories</option>

                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Job Type
              </label>

              <select
                value={jobType}
                onChange={(e) =>
                  applyFilterResetPage(() => setJobType(e.target.value))
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Job Types</option>

                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Mode */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Work Mode
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                {['all', ...WORK_MODES].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() =>
                      applyFilterResetPage(() => setWorkMode(mode))
                    }
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      workMode === mode
                        ? 'border-blue-700 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {mode === 'all' ? 'All' : mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Experience Level
              </label>

              <select
                value={experience}
                onChange={(e) =>
                  applyFilterResetPage(() => setExperience(e.target.value))
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Experience Levels</option>

                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>

            {/* Salary */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Minimum Annual Salary (INR)
              </label>

              <select
                value={salaryMin}
                onChange={(e) =>
                  applyFilterResetPage(() => setSalaryMin(e.target.value))
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="">Any Salary</option>
                <option value="200000">₹2 LPA+</option>
                <option value="300000">₹3 LPA+</option>
                <option value="500000">₹5 LPA+</option>
                <option value="800000">₹8 LPA+</option>
                <option value="1000000">₹10 LPA+</option>
                <option value="1500000">₹15 LPA+</option>
              </select>
            </div>

          </div>
        </aside>

        {/* Job Results */}
        <div className="lg:col-span-9">

          <div className="mb-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <p className="tabular-nums">
              Showing{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {jobs.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {pagination.total}
              </span>{' '}
              available jobs
            </p>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-6 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          ) : loading ? (
            <CardSkeleton count={4} />
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No jobs found in this location"
              description="Try another location such as Indore, Bhopal, Gwalior, Jabalpur or Ujjain. You can also change your search filters."
              actionLabel="Reset All Filters"
              onAction={resetAllFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    isSaved={savedIds.has(job._id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">

                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((p) => Math.max(1, p - 1))
                    }
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                    Page {pagination.page} of {pagination.pages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= pagination.pages}
                    onClick={() =>
                      setPage((p) => Math.min(pagination.pages, p + 1))
                    }
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Next
                  </button>

                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

