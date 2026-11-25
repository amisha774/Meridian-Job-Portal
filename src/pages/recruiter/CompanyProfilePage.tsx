import React, { useEffect, useState } from 'react';
import { Upload, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { companiesApi } from '../../services/api';
import { Company } from '../../types';
import { extractErrorMessage, getInitials } from '../../utils/formatters';

export const CompanyProfilePage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedId, setSelectedId] = useState<string>('new');
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('IT Services & Software Development');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [size, setSize] = useState('50-200 employees');
  const [foundedYear, setFoundedYear] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const populateForm = (company: Company | null) => {
    if (!company) {
      setSelectedId('new');
      setName('');
      setIndustry('IT Services & Software Development');
      setLocation('');
      setWebsite('');
      setSize('50-200 employees');
      setFoundedYear('');
      setDescription('');
      setLogoPreview('');
      setLogoFile(null);
      return;
    }

    setSelectedId(company._id);
    setName(company.name);
    setIndustry(company.industry);
    setLocation(company.location);
    setWebsite(company.website || '');
    setSize(company.size || '50-200 employees');
    setFoundedYear(company.foundedYear ? String(company.foundedYear) : '');
    setDescription(company.description);
    setLogoPreview(company.logo || '');
    setLogoFile(null);
  };

  useEffect(() => {
    companiesApi
      .myCompanies()
      .then(({ data }) => {
        setCompanies(data.companies);

        if (data.companies.length > 0) {
          populateForm(data.companies[0]);
        }
      })
      .catch(() => {
        toast.error('Unable to load company profiles.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();

      formData.append('name', name);
      formData.append('industry', industry);
      formData.append('location', location);
      formData.append('website', website);
      formData.append('size', size);

      if (foundedYear) {
        formData.append('foundedYear', foundedYear);
      }

      formData.append('description', description);

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      if (selectedId === 'new') {
        const { data } = await companiesApi.create(formData);

        setCompanies((prev) => [data.company, ...prev]);
        populateForm(data.company);

        toast.success(data.message);
      } else {
        const { data } = await companiesApi.update(selectedId, formData);

        setCompanies((prev) =>
          prev.map((c) =>
            c._id === selectedId ? data.company : c
          )
        );

        populateForm(data.company);

        toast.success(data.message);
      }
    } catch (err) {
      toast.error(
        extractErrorMessage(err, 'Failed to save company profile.')
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-sm text-slate-500">
        Loading company profiles...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">

      {/* Page Heading */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Company Profile
          </h1>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Add your company details and connect with job seekers across
            Indore and Madhya Pradesh.
          </p>
        </div>

        <button
          type="button"
          onClick={() => populateForm(null)}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
        >
          + Add New Company
        </button>

      </div>

      {/* Existing Companies */}

      {companies.length > 0 && (
        <div className="space-y-2">

          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Your Registered Companies
          </p>

          <div className="flex flex-wrap gap-2">

            {companies.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => populateForm(c)}
                className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
                  selectedId === c._id
                    ? 'border-blue-700 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                {c.name}
              </button>
            ))}

          </div>
        </div>
      )}

      {/* Company Form */}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5"
      >

        {/* Company Logo */}

        <div className="flex items-center gap-4">

          {logoPreview ? (
            <img
              src={logoPreview}
              alt={name || 'Company logo'}
              referrerPolicy="no-referrer"
              className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-display text-lg font-bold">
              {getInitials(name)}
            </div>
          )}

          <div>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800">

              <Upload className="h-3.5 w-3.5" />

              <span>Upload Company Logo</span>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  if (file.size > 3 * 1024 * 1024) {
                    toast.error('Logo size must be less than 3MB.');
                    e.target.value = '';
                    return;
                  }

                  setLogoFile(file);
                  setLogoPreview(URL.createObjectURL(file));
                }}
              />

            </label>

            <p className="mt-1 text-xs text-slate-500">
              PNG, JPG, or WEBP up to 3MB.
            </p>

          </div>
        </div>

        {/* Company Details */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Company Name
            </label>

            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your company name"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Industry
            </label>

            <input
              type="text"
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="IT Services & Software Development"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            />
          </div>

          {/* Location */}

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
              <MapPin className="h-4 w-4" />
              Company Location
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
              Example: Indore, Bhopal, Gwalior, Jabalpur or Ujjain.
            </p>
          </div>

          {/* Website */}

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Company Website
            </label>

            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourcompany.com"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            />
          </div>

          {/* Company Size */}

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Company Size
            </label>

            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            >
              <option value="1-50 employees">
                1-50 employees
              </option>

              <option value="50-200 employees">
                50-200 employees
              </option>

              <option value="200-500 employees">
                200-500 employees
              </option>

              <option value="500-1,000 employees">
                500-1,000 employees
              </option>

              <option value="1,000+ employees">
                1,000+ employees
              </option>
            </select>
          </div>

          {/* Founded Year */}

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Founded Year
            </label>

            <input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={foundedYear}
              onChange={(e) => setFoundedYear(e.target.value)}
              placeholder="Example: 2015"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
            />
          </div>

        </div>

        {/* Company Description */}

        <div>

          <label className="block text-sm font-medium mb-1.5">
            About Your Company
          </label>

          <textarea
            rows={5}
            required
            minLength={15}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your company, services, work culture, team and career opportunities. Example: We are an IT company based in Indore, Madhya Pradesh, working on web development, software solutions and digital technologies..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm"
          />

        </div>

        {/* Submit Button */}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
        >
          {saving
            ? 'Saving...'
            : selectedId === 'new'
            ? 'Create Company Profile'
            : 'Update Company Profile'}
        </button>

      </form>
    </div>
  );
};

