import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, helper }) => {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
        {value}
      </p>
      {helper && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helper}</p>
      )}
    </div>
  );
};
