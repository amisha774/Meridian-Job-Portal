import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { publicApi } from '../services/api';
import { extractErrorMessage } from '../utils/formatters';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await publicApi.subscribeNewsletter(email.trim());
      toast.success(data.message);
      setEmail('');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Unable to subscribe.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link
              to="/"
              className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Meridian
            </Link>
            <p className="mt-3 max-w-sm text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Structured hiring and career discovery platform connecting technical candidates, verified employers, and talent teams.
            </p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Explore</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/jobs" className="hover:text-slate-900 dark:hover:text-white">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-slate-900 dark:hover:text-white">
                  Companies
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-slate-900 dark:hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-slate-900 dark:hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Accounts</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/login" className="hover:text-slate-900 dark:hover:text-white">
                  Candidate Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-slate-900 dark:hover:text-white">
                  Recruiter Sign Up
                </Link>
              </li>
              <li>
                <Link to="/jobs?workMode=Remote" className="hover:text-slate-900 dark:hover:text-white">
                  Remote Roles
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Weekly Job Digest
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Receive verified engineering, product, and operations openings each Monday.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                aria-label="Email address for job digest"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
              >
                {submitting ? 'Joining...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-slate-200 dark:border-slate-800 pt-8 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Meridian Careers Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-900 dark:hover:text-white">
              Platform Standards
            </Link>
            <Link to="/contact" className="hover:text-slate-900 dark:hover:text-white">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
