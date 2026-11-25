import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { applicationsApi } from '../../services/api';
import { Application, ApplicationStatus } from '../../types';
import {
  APPLICATION_STATUS_META,
  extractErrorMessage,
  formatDate,
  formatDateTime,
  getInitials,
} from '../../utils/formatters';

export const CandidateDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('pending');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewMode, setInterviewMode] = useState<'Video' | 'Phone' | 'On-site'>('Video');
  const [interviewLink, setInterviewLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    applicationsApi
      .getById(id)
      .then(({ data }) => {
        const app = data.application;
        setApplication(app);
        setStatus(app.status);
        setNotes(app.recruiterNotes || '');
        if (app.interviewDate) {
          setInterviewDate(new Date(app.interviewDate).toISOString().slice(0, 16));
        }
        if (app.interviewMode) setInterviewMode(app.interviewMode);
        setInterviewLink(app.interviewLink || '');
      })
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;
    setSaving(true);
    try {
      const { data } = await applicationsApi.updateStatus(application._id, {
        status,
        recruiterNotes: notes,
        interviewDate: interviewDate || undefined,
        interviewMode,
        interviewLink,
      });
      setApplication((prev) => (prev ? { ...prev, ...data.application } : prev));
      toast.success('Candidate review saved & applicant notified.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading candidate profile...</div>;
  }

  if (!application) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-600">Application not found.</p>
        <Link to="/recruiter/applicants" className="mt-3 inline-block text-sm text-blue-700">
          Back to Applicants
        </Link>
      </div>
    );
  }

  const candidate = typeof application.applicant === 'object' ? application.applicant : null;
  const meta = APPLICATION_STATUS_META[application.status];

  return (
    <div className="space-y-6">
      <Link
        to="/recruiter/applicants"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to applicants</span>
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {candidate?.profileImage ? (
                  <img
                    src={candidate.profileImage}
                    alt={candidate.fullName}
                    referrerPolicy="no-referrer"
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-display text-base font-bold">
                    {getInitials(candidate?.fullName)}
                  </div>
                )}
                <div>
                  <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    {candidate?.fullName}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {candidate?.headline || candidate?.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {candidate?.email} {candidate?.phone ? `· ${candidate.phone}` : ''}{' '}
                    {candidate?.location ? `· ${candidate.location}` : ''}
                  </p>
                </div>
              </div>

              {application.resume?.url && (
                <a
                  href={application.resume.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 whitespace-nowrap"
                >
                  <FileText className="h-4 w-4" />
                  <span>Download Resume PDF</span>
                </a>
              )}
            </div>

            {candidate?.bio && (
              <p className="mt-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {candidate.bio}
              </p>
            )}

            {candidate?.skills && candidate.skills.length > 0 && (
              <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Skills
                </h2>
                <p className="mt-2 text-sm text-slate-800 dark:text-slate-200">
                  {candidate.skills.join(' · ')}
                </p>
              </div>
            )}
          </div>

          {application.coverLetter && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <h2 className="font-display text-base font-semibold">Cover Note</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {application.coverLetter}
              </p>
            </div>
          )}

          {candidate?.experience && candidate.experience.length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <h2 className="font-display text-base font-semibold">Experience</h2>
              {candidate.experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="border-t border-slate-100 dark:border-slate-800 pt-3 first:border-t-0 first:pt-0"
                >
                  <p className="text-sm font-semibold">
                    {exp.title} · {exp.company}
                  </p>
                  <p className="text-xs text-slate-500 tabular-nums">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate || 'Present'}
                  </p>
                  {exp.description && (
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {candidate?.education && candidate.education.length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
              <h2 className="font-display text-base font-semibold">Education</h2>
              {candidate.education.map((edu, idx) => (
                <div key={idx}>
                  <p className="text-sm font-semibold">{edu.degree}</p>
                  <p className="text-xs text-slate-500">
                    {edu.institution} · {edu.year}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:col-span-4">
          <form
            onSubmit={handleSave}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
          >
            <div>
              <p className="text-xs text-slate-500">Applied for</p>
              <p className="font-display text-base font-semibold">{application.job?.title}</p>
              <p className={`mt-1 text-xs font-semibold ${meta.textClass}`}>
                Current: {meta.label}
              </p>
              <p className="mt-1 text-xs text-slate-400 tabular-nums">
                Submitted {formatDate(application.createdAt)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stage</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
              >
                <option value="pending">Pending Review</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview Scheduled</option>
                <option value="hired">Offer / Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Interview Date & Time</label>
              <input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
              />
              {application.interviewDate && (
                <p className="mt-1 text-xs text-slate-500 tabular-nums">
                  Current: {formatDateTime(application.interviewDate)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mode</label>
              <select
                value={interviewMode}
                onChange={(e) =>
                  setInterviewMode(e.target.value as 'Video' | 'Phone' | 'On-site')
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
              >
                <option value="Video">Video</option>
                <option value="Phone">Phone</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Meeting Link / Location</label>
              <input
                type="text"
                value={interviewLink}
                onChange={(e) => setInterviewLink(e.target.value)}
                placeholder="https://meet.meridian.io/..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Recruiter Notes (Private)</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Evaluation notes for hiring panel..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Review & Notify'}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
};
