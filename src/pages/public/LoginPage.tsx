import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../../redux/authSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';

interface LoginFormValues {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const redirectForRole = (role: string) => {
    const from = (location.state as { from?: string } | null)?.from;
    if (from && !from.startsWith('/login') && !from.startsWith('/register')) {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'admin') navigate('/admin', { replace: true });
    else if (role === 'recruiter') navigate('/recruiter', { replace: true });
    else navigate('/seeker', { replace: true });
  };

  const onSubmit = async (values: LoginFormValues) => {
    const result = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.fullName}`);
      redirectForRole(result.payload.user.role);
    } else {
      toast.error((result.payload as string) || 'Sign in failed');
    }
  };

  const signInDemo = async (email: string) => {
    setValue('email', email);
    setValue('password', 'Password123!');
    const result = await dispatch(loginUser({ email, password: 'Password123!' }));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Signed in as ${result.payload.user.fullName}`);
      redirectForRole(result.payload.user.role);
    } else {
      toast.error((result.payload as string) || 'Sign in failed');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Sign in to Meridian
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
          Access your candidate, recruiter, or administrator workspace.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              placeholder="name@company.com"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              Password
            </label>
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              placeholder="••••••••"
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          New to Meridian?{' '}
          <Link to="/register" className="font-medium text-blue-700 dark:text-blue-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
