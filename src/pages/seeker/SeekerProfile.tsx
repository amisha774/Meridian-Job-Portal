
import React, { useState } from 'react';
import { FileText, Plus, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { setUser } from '../../redux/authSlice';
import { useAppDispatch } from '../../redux/store';
import { authApi } from '../../services/api';
import { EducationItem, ExperienceItem } from '../../types';
import { extractErrorMessage, formatDate, getInitials } from '../../utils/formatters';

export const SeekerProfile: React.FC = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [experience, setExperience] = useState<ExperienceItem[]>(user?.experience || []);
  const [education, setEducation] = useState<EducationItem[]>(user?.education || []);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.profileImage || '');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;

    if (!skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
    }

    setSkillInput('');
  };

  const addExperience = () => {
    setExperience([
      ...experience,
      {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      },
    ]);
  };

  const addEducation = () => {
    setEducation([
      ...education,
      { degree: '', institution: '', field: '', year: '' },
    ]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();

      formData.append('fullName', fullName);
      formData.append('phone', phone);
      formData.append('headline', headline);
      formData.append('location', location);
      formData.append('bio', bio);
      formData.append('skills', JSON.stringify(skills));
      formData.append(
        'experience',
        JSON.stringify(experience.filter((ex) => ex.title && ex.company))
      );
      formData.append(
        'education',
        JSON.stringify(education.filter((ed) => ed.degree && ed.institution))
      );

      if (avatarFile) formData.append('profileImage', avatarFile);
      if (resumeFile) formData.append('resume', resumeFile);

      const { data } = await authApi.updateProfile(formData);

      dispatch(setUser(data.user));

      setAvatarFile(null);
      setResumeFile(null);

      if (data.user.profileImage) {
        setAvatarPreview(data.user.profileImage);
      }

      toast.success(data.message);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  const analysis = user?.resume?.analysis;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Candidate Profile & Resume
        </h1>

        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Add your education, skills and work experience to connect with job
          opportunities across Indore and Madhya Pradesh.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">

          {/* Profile Photo and Basic Information */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={fullName}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-display text-lg font-bold">
                  {getInitials(fullName)}
                </div>
              )}

              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Profile Photo</span>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (file.size > 3 * 1024 * 1024) {
                        toast.error('Profile photo must be smaller than 3MB.');
                        e.target.value = '';
                        return;
                      }

                      setAvatarFile(file);
                      setAvatarPreview(URL.createObjectURL(file));
                    }}
                  />
                </label>

                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  JPG, PNG, or WEBP up to 3MB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Full Name
                </label>

                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Professional Headline
                </label>

                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="MERN Stack Developer | React.js | Node.js"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Current Location
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Vijay Nagar, Indore, Madhya Pradesh"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
                />

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Examples: Indore, Bhopal, Gwalior, Jabalpur, Ujjain, Dewas.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Professional Bio
              </label>

              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write about your B.Tech/B.E. education, technical skills, projects, achievements and preferred job roles..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
              />
            </div>
          </div>

          {/* Technical Skills */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h2 className="font-display text-base font-semibold">
              Technical & Core Skills
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="e.g. HTML, CSS, JavaScript, React, Node.js"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
              />

              <button
                type="button"
                onClick={addSkill}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Add
              </button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() =>
                      setSkills(skills.filter((s) => s !== skill))
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-red-400"
                  >
                    <span>{skill}</span>
                    <span className="text-slate-400">×</span>
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add skills that match your target roles, such as React.js,
              MongoDB, Express.js, Java, Python, SQL and Git.
            </p>
          </div>

          {/* Work Experience */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">
                Work Experience
              </h2>

              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Experience</span>
              </button>
            </div>

            {experience.map((exp, idx) => (
              <div
                key={idx}
                className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">
                    Position {idx + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setExperience(experience.filter((_, i) => i !== idx))
                    }
                    className="text-xs text-red-600 hover:underline inline-flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Job Role (e.g. Frontend Developer)"
                    value={exp.title}
                    onChange={(e) => {
                      const next = [...experience];
                      next[idx] = { ...exp, title: e.target.value };
                      setExperience(next);
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="Company Name"
                    value={exp.company}
                    onChange={(e) => {
                      const next = [...experience];
                      next[idx] = { ...exp, company: e.target.value };
                      setExperience(next);
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="Start Date (e.g. 2025-06)"
                    value={exp.startDate}
                    onChange={(e) => {
                      const next = [...experience];
                      next[idx] = { ...exp, startDate: e.target.value };
                      setExperience(next);
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="End Date (leave blank if currently working)"
                    value={exp.endDate || ''}
                    onChange={(e) => {
                      const next = [...experience];
                      next[idx] = { ...exp, endDate: e.target.value };
                      setExperience(next);
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Work Location (e.g. Indore, Madhya Pradesh)"
                  value={exp.location || ''}
                  onChange={(e) => {
                    const next = [...experience];
                    next[idx] = { ...exp, location: e.target.value };
                    setExperience(next);
                  }}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
                />

                <textarea
                  rows={2}
                  placeholder="Describe your responsibilities, projects and achievements..."
                  value={exp.description || ''}
                  onChange={(e) => {
                    const next = [...experience];
                    next[idx] = { ...exp, description: e.target.value };
                    setExperience(next);
                  }}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">
                Education
              </h2>

              <button
                type="button"
                onClick={addEducation}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            {education.map((edu, idx) => (
              <div
                key={idx}
                className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">
                    Qualification {idx + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setEducation(education.filter((_, i) => i !== idx))
                    }
                    className="text-xs text-red-600 hover:underline inline-flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Degree (e.g. B.Tech, B.E., MCA)"
                    value={edu.degree}
                    onChange={(e) => {
                      const next = [...education];
                      next[idx] = { ...edu, degree: e.target.value };
                      setEducation(next);
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="College / University Name"
                    value={edu.institution}
                    onChange={(e) => {
                      const next = [...education];
                      next[idx] = { ...edu, institution: e.target.value };
                      setEducation(next);
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="Graduation Year (e.g. 2026)"
                    value={edu.year}
                    onChange={(e) => {
                      const next = [...education];
                      next[idx] = { ...edu, year: e.target.value };
                      setEducation(next);
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Specialization (e.g. Computer Science)"
                  value={edu.field || ''}
                  onChange={(e) => {
                    const next = [...education];
                    next[idx] = { ...edu, field: e.target.value };
                    setEducation(next);
                  }}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>

          {/* Resume Upload */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h2 className="font-display text-base font-semibold">
              Resume (PDF)
            </h2>

            {user?.resume?.url && (
              <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="h-4 w-4 text-blue-700 dark:text-blue-400 shrink-0" />
                  <span className="truncate font-medium">
                    {user.resume.originalName}
                  </span>
                </div>

                <a
                  href={user.resume.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline whitespace-nowrap"
                >
                  Download PDF
                </a>
              </div>
            )}

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-6 text-center hover:border-blue-600 transition-colors">
              <Upload className="h-5 w-5 text-slate-500" />

              <span className="mt-2 text-sm font-medium">
                {resumeFile
                  ? `Selected: ${resumeFile.name}`
                  : 'Upload your latest PDF resume'}
              </span>

              <span className="mt-1 text-xs text-slate-500">
                Upload your resume to save it and analyze your skills.
              </span>

              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  if (file.size > 5 * 1024 * 1024) {
                    toast.error('Resume PDF must be smaller than 5MB.');
                    e.target.value = '';
                    return;
                  }

                  setResumeFile(file);
                }}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>

        {/* Resume Analysis Panel */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Resume Analysis
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Your resume is analyzed automatically whenever you upload a PDF.
              </p>
            </div>

            {!analysis || !analysis.score ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Upload your PDF resume and save your profile to see detected
                skills, resume sections and improvement suggestions.
              </p>
            ) : (
              <>
                <div className="border-y border-slate-200 dark:border-slate-800 py-4 flex items-baseline justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Resume Score
                  </span>

                  <span className="font-display text-2xl font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                    {analysis.score}/100
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Sections Detected ({analysis.sectionsFound.length})
                  </p>

                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {analysis.sectionsFound.join(' · ') || 'None detected'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Skills Extracted ({analysis.detectedSkills.length})
                  </p>

                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {analysis.detectedSkills.join(' · ') || 'No standard technical skills found'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Improvement Suggestions
                  </p>

                  <ul className="mt-1.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-disc pl-4">
                    {analysis.suggestions.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {analysis.analyzedAt && (
                  <p className="text-[11px] text-slate-400 tabular-nums">
                    Analyzed {formatDate(analysis.analyzedAt)} · {analysis.wordCount} words
                  </p>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

