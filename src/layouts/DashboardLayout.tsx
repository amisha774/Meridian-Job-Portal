import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  CalendarClock,
  ChevronDown,
  FileCheck2,
  LayoutDashboard,
  Headset,
  LogOut,
  Menu,
  PlusSquare,
  ShieldCheck,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../redux/notificationSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { formatRelativeTime, getInitials } from '../utils/formatters';

interface NavItem {
  label: string;
  to: string;
  icon: React.FC<{ className?: string }>;
  end?: boolean;
}

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { items: notifications, unreadCount } = useAppSelector((s) => s.notifications);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const role = user?.role || 'jobseeker';

  const navItems: NavItem[] =
    role === 'admin'
      ? [
          { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
          { label: 'All Users', to: '/admin/users', icon: Users },
          { label: 'Recruiters', to: '/admin/recruiters', icon: ShieldCheck },
          { label: 'Job Seekers', to: '/admin/job-seekers', icon: UserCircle },
          { label: 'Manage Jobs', to: '/admin/jobs', icon: Briefcase },
          { label: 'Companies', to: '/admin/companies', icon: Building2 },
          { label: 'Applications', to: '/admin/applications', icon: FileCheck2 },
          { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
          { label: 'Notifications', to: '/admin/notifications', icon: Bell },
        ]
      : role === 'recruiter'
      ? [
          { label: 'Overview', to: '/recruiter', icon: LayoutDashboard, end: true },
          { label: 'Company Profile', to: '/recruiter/company', icon: Building2 },
          { label: 'Post New Job', to: '/recruiter/jobs/new', icon: PlusSquare },
          { label: 'Manage Jobs', to: '/recruiter/jobs', icon: Briefcase, end: true },
          { label: 'Applicants', to: '/recruiter/applicants', icon: Users },
          { label: 'Interviews', to: '/recruiter/interviews', icon: CalendarClock },
          { label: 'Notifications', to: '/recruiter/notifications', icon: Bell },
          { label: 'Help & Support', to: '/recruiter/password', icon: Headset },
        ]
      : [
          { label: 'Overview', to: '/seeker', icon: LayoutDashboard, end: true },
          { label: 'My Profile', to: '/seeker/profile', icon: UserCircle },
          { label: 'My Applications', to: '/seeker/applications', icon: FileCheck2 },
          { label: 'Saved Jobs', to: '/seeker/saved-jobs', icon: Bookmark },
          { label: 'Browse Jobs', to: '/jobs', icon: Briefcase },
          { label: 'Notifications', to: '/seeker/notifications', icon: Bell },
          { label: 'Help & Support', to: '/seeker/password', icon: Headset },
        ];

  const baseDashboardPath =
    role === 'admin' ? '/admin' : role === 'recruiter' ? '/recruiter' : '/seeker';

  const currentNavLabel =
    navItems.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    )?.label || 'Workspace';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5">
          <Link
            to="/"
            className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Meridian
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="lg:hidden rounded-lg p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/70">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {role === 'admin'
              ? 'Platform Administration'
              : role === 'recruiter'
              ? 'Recruiter Workspace'
              : 'Candidate Workspace'}
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
           <div className="border-t border-slate-200 dark:border-slate-800 p-3">
           <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400"
            >
    <LogOut className="h-4 w-4 shrink-0" />
    <span>Sign out</span>
  </button>
</div>
</nav>
</aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <Link
                to={baseDashboardPath}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
              >
                Dashboard
              </Link>
              <span className="text-slate-400">/</span>
              <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {currentNavLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((p) => !p);
                  setProfileOpen(false);
                }}
                aria-label="Notifications"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-700 px-1 text-[10px] font-semibold text-white tabular-nums">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg z-50">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                    <span className="text-sm font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => dispatch(markAllNotificationsAsRead())}
                        className="text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.slice(0, 6).map((item) => (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => {
                            if (!item.isRead) dispatch(markNotificationAsRead(item._id));
                            setNotifOpen(false);
                            if (item.link) navigate(item.link);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors ${
                            !item.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {item.message}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400 tabular-nums">
                            {formatRelativeTime(item.createdAt)}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 text-center">
                    <Link
                      to={`${baseDashboardPath}/notifications`}
                      onClick={() => setNotifOpen(false)}
                      className="text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((p) => !p);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.fullName}
                    referrerPolicy="no-referrer"
                    className="h-7 w-7 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                    {getInitials(user?.fullName)}
                  </div>
                )}
                <span className="hidden sm:inline text-sm font-medium max-w-[140px] truncate">
                  {user?.fullName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 shadow-lg z-50">
                  <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-2.5">
                    <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  {role === 'jobseeker' && (
                    <Link
                      to="/seeker/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      My Profile
                    </Link>
                  )}
                  {role === 'recruiter' && (
                    <Link
                      to="/recruiter/company"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Company Profile
                    </Link>
                  )}
                  <Link
                    to={`${baseDashboardPath}/password`}
                    onClick={() => setProfileOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Change Password
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
