import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCheck, Trash2 } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  removeNotification,
} from '../../redux/notificationSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { formatRelativeTime } from '../../utils/formatters';

export const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, unreadCount, loading } = useAppSelector((s) => s.notifications);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Real-time updates for applications, shortlists, and scheduled interviews.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => dispatch(markAllNotificationsAsRead())}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-500">
          Loading notifications...
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="You are all caught up"
          description="Real-time alerts for application status changes, interviews, and new matches will appear here."
        />
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
          {items.map((item) => (
            <div
              key={item._id}
              className={`flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between ${
                !item.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h2>
                  {!item.isRead && (
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                      Unread
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.message}</p>
                <p className="mt-1.5 text-xs text-slate-400 tabular-nums">
                  {formatRelativeTime(item.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.link && (
                  <Link
                    to={item.link}
                    onClick={() => {
                      if (!item.isRead) dispatch(markNotificationAsRead(item._id));
                    }}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Open
                  </Link>
                )}
                {!item.isRead && (
                  <button
                    type="button"
                    onClick={() => dispatch(markNotificationAsRead(item._id))}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Mark read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dispatch(removeNotification(item._id))}
                  aria-label="Delete notification"
                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
