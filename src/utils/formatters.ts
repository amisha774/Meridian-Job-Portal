import { ApplicationStatus, JobStatus } from '../types';

export function formatSalary(salary?: {
  min: number;
  max: number;
  currency?: string;
  period?: string;
}): string {
  if (!salary) return 'Competitive';
  const currency = salary.currency || 'USD';
  const symbol = currency === 'USD' ? '$' : `${currency} `;

  if (salary.period === 'hourly') {
    return `${symbol}${salary.min}–${symbol}${salary.max}/hr`;
  }
  if (salary.period === 'monthly') {
    return `${symbol}${salary.min.toLocaleString()}–${symbol}${salary.max.toLocaleString()}/mo`;
  }
  const minK = salary.min >= 1000 ? `${Math.round(salary.min / 1000)}k` : salary.min;
  const maxK = salary.max >= 1000 ? `${Math.round(salary.max / 1000)}k` : salary.max;
  return `${symbol}${minK} – ${symbol}${maxK}/yr`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}

export function getInitials(name?: string): string {
  if (!name) return 'M';
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

export const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  { label: string; textClass: string; bgClass: string }
> = {
  pending: {
    label: 'Pending Review',
    textClass: 'text-slate-700 dark:text-slate-300',
    bgClass: 'bg-slate-100 dark:bg-slate-800',
  },
  reviewed: {
    label: 'Reviewed',
    textClass: 'text-blue-700 dark:text-blue-300',
    bgClass: 'bg-blue-50 dark:bg-blue-950/60',
  },
  shortlisted: {
    label: 'Shortlisted',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/60',
  },
  interview: {
    label: 'Interview Scheduled',
    textClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-50 dark:bg-amber-950/60',
  },
  hired: {
    label: 'Offer / Hired',
    textClass: 'text-emerald-800 dark:text-emerald-200',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/60',
  },
  rejected: {
    label: 'Not Selected',
    textClass: 'text-red-700 dark:text-red-300',
    bgClass: 'bg-red-50 dark:bg-red-950/60',
  },
  withdrawn: {
    label: 'Withdrawn',
    textClass: 'text-slate-500 dark:text-slate-400',
    bgClass: 'bg-slate-100 dark:bg-slate-800/70',
  },
};

export const JOB_STATUS_META: Record<
  JobStatus,
  { label: string; textClass: string }
> = {
  active: { label: 'Active', textClass: 'text-emerald-700 dark:text-emerald-400' },
  closed: { label: 'Closed', textClass: 'text-slate-500 dark:text-slate-400' },
  draft: { label: 'Draft', textClass: 'text-amber-600 dark:text-amber-400' },
  flagged: { label: 'Flagged for Review', textClass: 'text-red-600 dark:text-red-400' },
};

export function extractErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
  return anyErr?.response?.data?.message || anyErr?.message || fallback;
}
