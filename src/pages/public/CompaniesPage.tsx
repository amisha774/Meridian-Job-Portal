import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { CompanyCard } from '../../components/CompanyCard';
import { EmptyState } from '../../components/EmptyState';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { companiesApi } from '../../services/api';
import { Company } from '../../types';

export const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [q, setQ] = useState('');
  const [industry, setIndustry] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    companiesApi
      .list({
        q: q || undefined,
        industry: industry !== 'all' ? industry : undefined,
      })
      .then(({ data }) => setCompanies(data.companies))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, industry]);

  const industries = [
    'Cloud Infrastructure',
    'Design Software',
    'Enterprise Data',
    'Biotechnology',
    'Supply Chain',
    'Robotics & Hardware',
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Verified Organizations
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
          Discover teams, engineering cultures, and open roles across Meridian partner companies.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search company name, industry, or city..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            aria-label="Filter by industry"
            className="sm:w-64 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100"
          >
            <option value="all">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <CardSkeleton count={4} />
        ) : companies.length === 0 ? (
          <EmptyState
            title="No matching companies"
            description="Adjust your search query or industry filter to view all registered employers."
            actionLabel="Show All Companies"
            onAction={() => {
              setQ('');
              setIndustry('all');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <CompanyCard key={company._id} company={company} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
