import React, { useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { applicationsApi } from '../services/api';
import { Job } from '../types';
import { extractErrorMessage } from '../utils/formatters';

interface ApplyModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ job, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [useSavedResume, setUseSavedResume] = useState(Boolean(user?.resume?.url));
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const companyName = typeof job.company === 'object' ? job.company.name : 'Employer';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useSavedResume && !resumeFile) {
      toast.error('Please upload a PDF resume or use your saved profile resume.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      if (!useSavedResume && resumeFile) {
        formData.append('resume', resumeFile);
      }

      await applicationsApi.apply(job._id, formData);
      toast.success('Application submitted successfully.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not submit application.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2
              id="apply-modal-title"
              className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              Apply for {job.title}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {companyName} · {job.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close application dialog"
            className="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">
              Resume (PDF)
            </label>

            {user?.resume?.url && (
              <div className="mb-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setUseSavedResume(true)}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-left text-xs transition-colors ${
                    useSavedResume
                      ? 'border-blue-700 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">Use saved: {user.resume.originalName}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setUseSavedResume(false)}
                  className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    !useSavedResume
                      ? 'border-blue-700 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Upload new PDF
                </button>
              </div>
            )}

            {(!user?.resume?.url || !useSavedResume) && (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-6 text-center hover:border-blue-600 transition-colors">
                <Upload className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                <span className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {resumeFile ? resumeFile.name : 'Select PDF resume (max 5MB)'}
                </span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file && file.type !== 'application/pdf') {
                      toast.error('Only PDF files are accepted.');
                      return;
                    }
                    setResumeFile(file);
                    setUseSavedResume(false);
                  }}
                />
              </label>
            )}
          </div>

          <div>
            <label
              htmlFor="coverLetter"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
            >
              Cover Letter / Note to Hiring Team
            </label>
            <textarea
              id="coverLetter"
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Briefly explain your relevant experience and why you are interested in this role..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
