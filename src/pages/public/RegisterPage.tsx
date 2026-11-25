import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../../redux/authSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';

interface RegisterFormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'jobseeker' | 'recruiter';
}

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'jobseeker';

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      role: initialRole,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (values: RegisterFormValues) => {
    const result = await dispatch(registerUser(values));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created successfully.');
      if (result.payload.user.role === 'recruiter') {
        navigate('/recruiter/company', { replace: true });
      } else {
        navigate('/seeker/profile', { replace: true });
      }
    } else {
      toast.error((result.payload as string) || 'Registration failed');
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Create your Meridian account
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
          Select your role to unlock the candidate or hiring team workspace.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              {...register('fullName', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'At least 2 characters' },
              })}
              placeholder="Jordan Patel"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="jordan@example.com"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                {...register('phone')}
                placeholder="+1 (555) 234-5678"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Password
            </label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              })}
              placeholder="Minimum 6 characters"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-700 dark:text-blue-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
