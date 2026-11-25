import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';
import { extractErrorMessage } from '../../utils/formatters';

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePasswordPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>();

  const newPasswordValue = watch('newPassword');

  const onSubmit = async (values: PasswordFormValues) => {
    try {
      const { data } = await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success(data.message);
      reset();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Unable to change password.'));
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Change Password
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Keep your account secure by using a unique password of at least 6 characters.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
            Current Password
          </label>
          <input
            type="password"
            {...register('currentPassword', { required: 'Current password is required' })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm"
          />
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
            New Password
          </label>
          <input
            type="password"
            {...register('newPassword', {
              required: 'New password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm"
          />
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            {...register('confirmPassword', {
              required: 'Please confirm your new password',
              validate: (val) => val === newPasswordValue || 'Passwords do not match',
            })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
        >
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};
