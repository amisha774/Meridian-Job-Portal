import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SocketProvider } from './context/SocketContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { fetchCurrentUser } from './redux/authSlice';
import { useAppDispatch, useAppSelector } from './redux/store';
import { TOKEN_STORAGE_KEY } from './services/api';

// Public Pages
import { AboutPage } from './pages/public/AboutPage';
import { AllJobsPage } from './pages/public/AllJobsPage';
import { CompaniesPage } from './pages/public/CompaniesPage';
import { CompanyDetailsPage } from './pages/public/CompanyDetailsPage';
import { ContactPage } from './pages/public/ContactPage';
import { HomePage } from './pages/public/HomePage';
import { JobDetailsPage } from './pages/public/JobDetailsPage';
import { LoginPage } from './pages/public/LoginPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Shared Dashboard Pages
import { ChangePasswordPage } from './pages/shared/ChangePasswordPage';
import { NotificationsPage } from './pages/shared/NotificationsPage';

// Job Seeker Pages
import { SavedJobsPage } from './pages/seeker/SavedJobsPage';
import { SeekerApplications } from './pages/seeker/SeekerApplications';
import { SeekerDashboard } from './pages/seeker/SeekerDashboard';
import { SeekerProfile } from './pages/seeker/SeekerProfile';

// Recruiter Pages
import { ApplicantsPage } from './pages/recruiter/ApplicantsPage';
import { CandidateDetailsPage } from './pages/recruiter/CandidateDetailsPage';
import { CompanyProfilePage } from './pages/recruiter/CompanyProfilePage';
import { InterviewManagementPage } from './pages/recruiter/InterviewManagementPage';
import { ManageJobsPage } from './pages/recruiter/ManageJobsPage';
import { PostJobPage } from './pages/recruiter/PostJobPage';
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';

// Admin Pages
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminJobsPage } from './pages/admin/AdminJobsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

export default function App() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((s) => s.theme.mode);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style:
              themeMode === 'dark'
                ? {
                    background: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #1e293b',
                    fontSize: '13px',
                  }
                : {
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #e2e8f0',
                    fontSize: '13px',
                  },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<AllJobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/:id" element={<CompanyDetailsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Job Seeker Dashboard Routes */}
          <Route
            path="/seeker"
            element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SeekerDashboard />} />
            <Route path="profile" element={<SeekerProfile />} />
            <Route path="edit-profile" element={<SeekerProfile />} />
            <Route path="applications" element={<SeekerApplications />} />
            <Route path="saved-jobs" element={<SavedJobsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="password" element={<ChangePasswordPage />} />
          </Route>

          {/* Recruiter Dashboard Routes */}
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RecruiterDashboard />} />
            <Route path="company" element={<CompanyProfilePage />} />
            <Route path="company/new" element={<CompanyProfilePage />} />
            <Route path="jobs" element={<ManageJobsPage />} />
            <Route path="jobs/new" element={<PostJobPage />} />
            <Route path="jobs/:id/edit" element={<PostJobPage />} />
            <Route path="applicants" element={<ApplicantsPage />} />
            <Route path="applicants/:id" element={<CandidateDetailsPage />} />
            <Route path="interviews" element={<InterviewManagementPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="password" element={<ChangePasswordPage />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersPage defaultRole="all" title="Manage Users" />} />
            <Route
              path="recruiters"
              element={<AdminUsersPage defaultRole="recruiter" title="Manage Recruiters" />}
            />
            <Route
              path="job-seekers"
              element={<AdminUsersPage defaultRole="jobseeker" title="Manage Job Seekers" />}
            />
            <Route path="jobs" element={<AdminJobsPage />} />
            <Route path="companies" element={<AdminCompaniesPage />} />
            <Route path="applications" element={<AdminApplicationsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="password" element={<ChangePasswordPage />} />
          </Route>
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}
