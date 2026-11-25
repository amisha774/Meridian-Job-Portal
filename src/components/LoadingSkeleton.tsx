import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 animate-pulse"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="h-4 w-44 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
            <div className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="mt-4 h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-24 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 px-5 py-4 animate-pulse">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-20 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
};
