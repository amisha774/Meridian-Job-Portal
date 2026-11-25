import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Company } from '../types';
import { getInitials } from '../utils/formatters';

export const CompanyCard: React.FC<{ company: Company }> = ({ company }) => {
  return (
    <Link
      to={`/companies/${company._id}`}
      className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-colors hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-display text-sm font-bold text-slate-800 dark:text-slate-100">
              {getInitials(company.name)}
            </div>
          )}
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors" />
        </div>

        <h3 className="mt-4 font-display text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
          {company.name}
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {company.industry} · {company.location}
        </p>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {company.description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">{company.size || 'Growing team'}</span>
        <span className="font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
          {company.openJobsCount ?? 0} open roles
        </span>
      </div>
    </Link>
  );
};
