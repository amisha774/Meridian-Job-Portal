
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { companiesApi, jobsApi } from '../../services/api';
import { Company } from '../../types';
import { extractErrorMessage } from '../../utils/formatters';

const CATEGORIES = [
  'Software Engineering',
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Data Science & AI',
  'DevOps & Cloud',
  'UI/UX Design',
  'Software Testing',
  'Digital Marketing',
  'Product Management',
];

export const PostJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [workMode, setWorkMode] = useState('Hybrid');
  const [experience, setExperience] = useState('Entry Level');

  // Salary in INR
  const [salaryMin, setSalaryMin] = useState('300000');
  const [salaryMax, setSalaryMax] = useState('500000');
  const [salaryPeriod, setSalaryPeriod] = useState<'yearly' | 'monthly' | 'hourly'>('yearly');

  const [vacancies, setVacancies] = useState('1');

  const [deadline, setDeadline] = useState(() => {
    const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });

  const [skillsText, setSkillsText] = useState('');
  const [description, setDescription] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const { data: compData } = await companiesApi.myCompanies();

        setCompanies(compData.companies);

        if (compData.companies[0]) {
          setCompany(compData.companies[0]._id);
        }

        if (id) {
          const { data: jobData } = await jobsApi.getById(id);
          const j = jobData.job;

          setTitle(j.title);
          setCategory(j.category);
          setLocation(j.location);
          setJobType(j.jobType);
          setWorkMode(j.workMode);
          setExperience(j.experience);
          setSalaryMin(String(j.salary.min));
          setSalaryMax(String(j.salary.max));
          setSalaryPeriod(j.salary.period);
          setVacancies(String(j.vacancies));
          setDeadline(new Date(j.deadline).toISOString().slice(0, 10));
          setSkillsText(j.skills.join(', '));
          setDescription(j.description);
          setRequirementsText((j.requirements || []).join('\n'));
          setBenefitsText((j.benefits || []).join('\n'));
          setIsFeatured(j.isFeatured);

          if (typeof j.company === 'object') {
            setCompany(j.company._id);
          }
        }
      } catch (err) {
        toast.error(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Number(salaryMin) > Number(salaryMax)) {
      toast.error('Minimum salary cannot be greater than maximum salary.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        company,
        title,
        category,
        location,
        jobType,
        workMode,
        experience,
        salary: {
          min: Number(salaryMin),
          max: Number(salaryMax),
          currency: 'INR',
          period: salaryPeriod,
        },
        vacancies: Number(vacancies) || 1,
        deadline,
        skills: skillsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        description,
        requirements: requirementsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        benefits: benefitsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        isFeatured,
      };

      if (isEditing && id) {
        await jobsApi.update(id, payload);
        toast.success('Job listing updated successfully.');
      } else {
        await jobsApi.create(payload);
        toast.success('Job vacancy published successfully.');
      }

      navigate('/recruiter/jobs');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not save job posting.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-sm text-slate-500">
        Loading job editor...
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="max-w-xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
        <h1 className="font-display text-xl font-bold">
          Company Profile Required
        </h1>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Please create your company profile before publishing a job vacancy
          for candidates in Indore and Madhya Pradesh.
        </p>

        <Link
          to="/recruiter/company"
          className="mt-5 inline-block rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white"
        >
          Create Company Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">

      {/* Page Heading */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {isEditing ? 'Edit Job Posting' : 'Post a New Job'}
        </h1>

        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Share job opportunities with talented candidates across Indore
          and Madhya Pradesh.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5"
      >

        {/* Company and Category */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Company Name
            </label>

            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isEditing}
              required
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            >
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Job Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Job Title and Location */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Job Title
            </label>

            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="MERN Stack Developer"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Job Location
            </label>

            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Vijay Nagar, Indore, Madhya Pradesh"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            />

            <p className="mt-1 text-xs text-slate-500">
              Examples: Indore, Bhopal, Gwalior, Jabalpur, Ujjain, Dewas
            </p>
          </div>
        </div>

        {/* Job Type, Work Mode and Experience */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Job Type
            </label>

            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            >
              {['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Work Mode
            </label>

            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            >
              {['Remote', 'Hybrid', 'On-site'].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Experience Level
            </label>

            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            >
              {['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Executive'].map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Salary Details */}
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Salary Details (Indian Rupees)
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Minimum Salary (₹)
              </label>

              <input
                type="number"
                required
                min={0}
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="300000"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm tabular-nums"
              />

              <p className="mt-1 text-xs text-slate-500">
                Example: 300000 = ₹3 LPA
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Maximum Salary (₹)
              </label>

              <input
                type="number"
                required
                min={0}
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="500000"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm tabular-nums"
              />

              <p className="mt-1 text-xs text-slate-500">
                Example: 500000 = ₹5 LPA
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Pay Period
              </label>

              <select
                value={salaryPeriod}
                onChange={(e) => setSalaryPeriod(e.target.value as 'yearly' | 'monthly' | 'hourly')}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Number of Vacancies
              </label>

              <input
                type="number"
                min={1}
                value={vacancies}
                onChange={(e) => setVacancies(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Deadline and Skills */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Application Deadline
            </label>

            <input
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Required Skills (comma-separated)
            </label>

            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="React, JavaScript, Node.js, MongoDB"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Job Description
          </label>

          <textarea
            rows={4}
            required
            minLength={20}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the job role, daily responsibilities, company work culture and project details..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
          />
        </div>

        {/* Requirements and Benefits */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Job Requirements (one per line)
            </label>

            <textarea
              rows={4}
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              placeholder={'B.Tech / B.E. in Computer Science or related field\nKnowledge of React and JavaScript\nBasic knowledge of MongoDB'}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Job Benefits (one per line)
            </label>

            <textarea
              rows={4}
              value={benefitsText}
              onChange={(e) => setBenefitsText(e.target.value)}
              placeholder={'Flexible working hours\nLearning and development opportunities\nPaid leaves\nCareer growth opportunities'}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        {/* Featured Job */}
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-700"
          />

          <span>
            Show this job as a Featured Position on homepage
          </span>
        </label>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
          >
            {submitting
              ? 'Saving...'
              : isEditing
              ? 'Update Job Posting'
              : 'Publish Job'}
          </button>

          <Link
            to="/recruiter/jobs"
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Cancel
          </Link>

        </div>
      </form>
    </div>
  );
};
