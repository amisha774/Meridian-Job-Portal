import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { CompanyCard } from '../../components/CompanyCard';
import { JobCard } from '../../components/JobCard';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../hooks/useAuth';
import { publicApi, savedJobsApi } from '../../services/api';
import { Company, Job } from '../../types';
import { extractErrorMessage } from '../../utils/formatters';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [topCompanies, setTopCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [stats, setStats] = useState({
    activeJobsCount: 0,
    companiesCount: 0,
    candidatesCount: 0
  });
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadHome() {
      try {
        const { data } = await publicApi.getHome();

        if (!active) return;

        setFeaturedJobs(data.featuredJobs);
        setLatestJobs(data.latestJobs);
        setTopCompanies(data.topCompanies);
        setCategories(data.categories);
        setStats(data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHome();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'jobseeker') {
      setSavedIds(new Set());
      return;
    }

    savedJobsApi
      .list()
      .then(({ data }) => {
        setSavedIds(new Set(data.savedJobs.map((s) => s.job._id)));
      })
      .catch(() => {});
  }, [isAuthenticated, user?.role]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (locationQuery.trim()) params.set('location', locationQuery.trim());

    navigate(`/jobs?${params.toString()}`);
  };

  const handleToggleSave = async (jobId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to save jobs.');
      navigate('/login');
      return;
    }

    if (user?.role !== 'jobseeker') {
      toast.error('Only job seekers can save jobs.');
      return;
    }

    try {
      const { data } = await savedJobsApi.toggle(jobId);

      setSavedIds((prev) => {
        const next = new Set(prev);

        if (data.saved) next.add(jobId);
        else next.delete(jobId);

        return next;
      });

      toast.success(data.message);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newsletterEmail.trim()) return;

    setSubscribing(true);

    try {
      const { data } = await publicApi.subscribeNewsletter(newsletterEmail.trim());

      toast.success(data.message);
      setNewsletterEmail('');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div>

      {/* Hero Section */}

      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">

            <div className="lg:col-span-7 flex flex-col justify-center">

              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Find the Best Jobs Across Madhya Pradesh
              </p>

              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl text-balance leading-[1.12]">
                Find Your Dream Job in Indore and Across India
              </h1>

              <p className="mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Discover the latest job opportunities in Indore, Bhopal,
                Gwalior, Jabalpur and other cities of Madhya Pradesh.
                Search jobs, explore companies and apply for the right
                opportunity according to your skills.
              </p>

              <form
                onSubmit={handleSearch}
                className="mt-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 shadow-sm"
              >

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Job title, skills or company"
                      aria-label="Job title, skill, or keyword"
                      className="w-full rounded-lg bg-white dark:bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="relative sm:w-52">
                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="Indore, Bhopal, MP"
                      aria-label="Location"
                      className="w-full rounded-lg bg-white dark:bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    Search Jobs
                  </button>

                </div>
              </form>

              <div className="mt-8 grid grid-cols-3 gap-6 border-t border-slate-200 dark:border-slate-800 pt-6 max-w-lg">

                <div>
                  <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {stats.activeJobsCount}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Active Jobs
                  </p>
                </div>

                <div>
                  <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {stats.companiesCount}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Companies
                  </p>
                </div>

                <div>
                  <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {stats.candidatesCount}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Job Seekers
                  </p>
                </div>

              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-full min-h-[300px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                <img
                  src="/src/assets/images/hero_modern_workspace_1795108889649.jpg"
                  alt="Professionals working in an Indian IT office"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Popular Locations */}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Popular Job Locations in Madhya Pradesh
        </h2>

        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Explore job opportunities in your preferred city.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">

          {[
            'Indore',
            'Bhopal',
            'Gwalior',
            'Jabalpur',
            'Ujjain',
            'Dewas'
          ].map((city) => (

            <Link
              key={city}
              to={`/jobs?location=${encodeURIComponent(city)}`}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center hover:border-blue-600 transition-colors"
            >
              <MapPin className="mx-auto h-5 w-5 text-blue-700 dark:text-blue-400" />

              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {city}
              </p>
            </Link>

          ))}

        </div>
      </section>

      {/* Popular Categories */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

        <div className="flex items-end justify-between gap-4">

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Explore Jobs by Category
            </h2>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Find jobs in different technical and professional fields.
            </p>
          </div>

          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
          >
            <span>All Categories</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {categories.map((cat) => (

            <Link
              key={cat.name}
              to={`/jobs?category=${encodeURIComponent(cat.name)}`}
              className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 hover:border-blue-600 dark:hover:border-blue-500 transition-colors flex items-center justify-between"
            >

              <div>
                <p className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                  {cat.name}
                </p>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {cat.count} open {cat.count === 1 ? 'position' : 'positions'}
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors" />

            </Link>

          ))}

        </div>
      </section>

      {/* Featured Jobs */}

      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <div className="flex items-end justify-between gap-4">

            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Featured Jobs in Madhya Pradesh
              </h2>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Explore popular job openings from companies across Indore and MP.
              </p>
            </div>

            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
            >
              <span>View All Jobs</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>

          <div className="mt-7">

            {loading ? (
              <CardSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {featuredJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    isSaved={savedIds.has(job._id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}

              </div>
            )}

          </div>
        </div>
      </section>

      {/* Latest Job Listings */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

        <div className="flex items-end justify-between gap-4">

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Latest Job Opportunities
            </h2>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Discover recently added jobs in Indore, Bhopal and other cities.
            </p>
          </div>

          <Link
            to="/jobs?sort=newest"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
          >
            <span>Browse Latest</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>

        <div className="mt-7">

          {loading ? (
            <CardSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

              {latestJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  isSaved={savedIds.has(job._id)}
                  onToggleSave={handleToggleSave}
                />
              ))}

            </div>
          )}

        </div>
      </section>

      {/* Top Companies */}

      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <div className="flex items-end justify-between gap-4">

            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Top Companies in Madhya Pradesh
              </h2>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Explore companies and discover career opportunities across Indore and other MP cities.
              </p>
            </div>

            <Link
              to="/companies"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
            >
              <span>All Companies</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>

          <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            {loading ? (
              <CardSkeleton count={3} />
            ) : (
              topCompanies.map((company) => (
                <CompanyCard
                  key={company._id}
                  company={company}
                />
              ))
            )}

          </div>
        </div>
      </section>

      {/* How It Works */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

        <div className="max-w-2xl">

          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            How Our Job Portal Works
          </h2>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            A simple process to find jobs, apply online and track your applications.
          </p>

        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">

            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              01. Create Your Profile
            </h3>

            <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Create your account, add your education, skills and experience,
              and upload your resume to build your professional profile.
            </p>

          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">

            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              02. Search and Apply for Jobs
            </h3>

            <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Search for jobs in Indore, Bhopal and other cities.
              Select suitable opportunities and apply online.
            </p>

          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">

            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              03. Track Your Applications
            </h3>

            <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Check your application status, receive updates and
              stay informed about your hiring process.
            </p>

          </div>

        </div>
      </section>

      {/* Call to Action */}

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col justify-between">

            <div>
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                For Job Seekers
              </p>

              <h3 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white">
                Find the Right Job for Your Skills
              </h3>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Create your profile, upload your resume, explore jobs,
                save opportunities and track your applications in one place.
              </p>
            </div>

            <div className="mt-6">
              <Link
                to="/register?role=jobseeker"
                className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
              >
                Register as Job Seeker
              </Link>
            </div>

          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 dark:bg-slate-900/90 p-8 text-white flex flex-col justify-between">

            <div>
              <p className="text-xs font-semibold text-blue-400">
                For Recruiters
              </p>

              <h3 className="mt-2 font-display text-2xl font-bold">
                Hire Skilled Candidates for Your Company
              </h3>

              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Register your company, publish job openings,
                review applications and find the right candidates
                for your organization.
              </p>
            </div>

            <div className="mt-6">
              <Link
                to="/register?role=recruiter"
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Register as Recruiter
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* Newsletter */}

      <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 sm:p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-xl">

              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Get Latest Job Updates
              </h3>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Receive updates about new job openings in Indore,
                Bhopal and across Madhya Pradesh.
              </p>

            </div>

            <form
              onSubmit={handleNewsletter}
              className="flex w-full max-w-md gap-2"
            >

              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Newsletter email"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
              />

              <button
                type="submit"
                disabled={subscribing}
                className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
              >
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </button>

            </form>

          </div>

        </div>
      </section>

    </div>
  );
};

