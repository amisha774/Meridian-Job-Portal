
import React from 'react';
import { useForm } from 'react-hook-form';
import { Mail, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { publicApi } from '../../services/api';
import { extractErrorMessage } from '../../utils/formatters';

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const ContactPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>();

  const onSubmit = async (values: ContactFormValues) => {
    try {
      const { data } = await publicApi.sendContact(values);
      toast.success(data.message);
      reset();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to send message.'));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">

        {/* Contact Information */}
        <div className="lg:col-span-5">

          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
            Contact Us
          </p>

          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Get in Touch with Meridian Job Portal
          </h1>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Have questions about finding jobs, applying for opportunities,
            or hiring candidates? Our support team is here to help job seekers
            and employers across Indore and Madhya Pradesh.
          </p>

          <div className="mt-8 space-y-5 border-t border-slate-200 dark:border-slate-800 pt-6 text-sm">

            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />

              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Email Address
                </p>

                <p className="text-slate-600 dark:text-slate-400">
                  support@meridian.io
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />

              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Contact Number
                </p>

                <p className="text-slate-600 dark:text-slate-400 tabular-nums">
                  +91 XXXXX XXXXX
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Replace with your actual contact number.
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />

              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Location
                </p>

                <p className="text-slate-600 dark:text-slate-400">
                  Indore, Madhya Pradesh, India
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5"
          >

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                  Full Name
                </label>

                <input
                  type="text"
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />

                {errors.name && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                  Email Address
                </label>

                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Enter a valid email',
                    },
                  })}
                  placeholder="yourname@gmail.com"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />

                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                Subject
              </label>

              <input
                type="text"
                {...register('subject', {
                  required: 'Subject is required',
                  minLength: {
                    value: 3,
                    message: 'Subject must be at least 3 characters',
                  },
                })}
                placeholder="Job inquiry, hiring support or account help"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              />

              {errors.subject && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.subject.message}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                Your Message
              </label>

              <textarea
                rows={5}
                {...register('message', {
                  required: 'Message is required',
                  minLength: {
                    value: 10,
                    message: 'Message must be at least 10 characters',
                  },
                })}
                placeholder="Write your message here. Tell us how we can help you..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              />

              {errors.message && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? 'Sending Message...' : 'Send Message'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

