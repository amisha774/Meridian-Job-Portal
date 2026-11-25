import axios from 'axios';
import type {
  AdminDashboardData,
  Application,
  Company,
  Job,
  NotificationItem,
  PaginationMeta,
  SavedJobItem,
  User,
} from '../types';

export const TOKEN_STORAGE_KEY = 'meridian_jwt_token';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const url = String(error?.config?.url || '');
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    role: 'jobseeker' | 'recruiter';
  }) => apiClient.post<{ success: boolean; token: string; user: User }>('/auth/register', payload),

  login: (payload: { email: string; password: string }) =>
    apiClient.post<{ success: boolean; token: string; user: User }>('/auth/login', payload),

  logout: () => apiClient.post('/auth/logout'),

  me: () => apiClient.get<{ success: boolean; user: User }>('/auth/me'),

  updateProfile: (formData: FormData) =>
    apiClient.put<{ success: boolean; user: User; message: string }>('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    apiClient.put<{ success: boolean; message: string }>('/auth/password', payload),
};

export const publicApi = {
  getHome: () =>
    apiClient.get<{
      success: boolean;
      featuredJobs: Job[];
      latestJobs: Job[];
      topCompanies: Company[];
      categories: Array<{ name: string; count: number }>;
      stats: { activeJobsCount: number; companiesCount: number; candidatesCount: number };
    }>('/public/home'),

  subscribeNewsletter: (email: string) =>
    apiClient.post<{ success: boolean; message: string }>('/public/newsletter', { email }),

  sendContact: (payload: { name: string; email: string; subject: string; message: string }) =>
    apiClient.post<{ success: boolean; message: string }>('/public/contact', payload),
};

export const jobsApi = {
  list: (params: Record<string, string | number | boolean | undefined> = {}) =>
    apiClient.get<{ success: boolean; jobs: Job[]; pagination: PaginationMeta }>('/jobs', { params }),

  categories: () =>
    apiClient.get<{ success: boolean; categories: Array<{ name: string; count: number }> }>(
      '/jobs/categories'
    ),

  recommendations: () =>
    apiClient.get<{ success: boolean; jobs: Job[] }>('/jobs/recommendations'),

  myJobs: () => apiClient.get<{ success: boolean; jobs: Job[] }>('/jobs/my'),

  getById: (id: string) =>
    apiClient.get<{
      success: boolean;
      job: Job;
      meta: { isSaved: boolean; hasApplied: boolean; existingApplicationId: string | null };
    }>(`/jobs/${id}`),

  create: (payload: Record<string, unknown>) =>
    apiClient.post<{ success: boolean; job: Job; message: string }>('/jobs', payload),

  update: (id: string, payload: Record<string, unknown>) =>
    apiClient.put<{ success: boolean; job: Job; message: string }>(`/jobs/${id}`, payload),

  remove: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/jobs/${id}`),

  report: (id: string, reason: string) =>
    apiClient.post<{ success: boolean; message: string }>(`/jobs/${id}/report`, { reason }),
};

export const applicationsApi = {
  apply: (jobId: string, formData: FormData) =>
    apiClient.post<{ success: boolean; application: Application; message: string }>(
      `/applications/${jobId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  myApplications: () =>
    apiClient.get<{ success: boolean; applications: Application[] }>('/applications/my'),

  recruiterApplications: (params: Record<string, string | undefined> = {}) =>
    apiClient.get<{ success: boolean; applications: Application[] }>('/applications/recruiter', {
      params,
    }),

  byJob: (jobId: string) =>
    apiClient.get<{ success: boolean; applications: Application[] }>(
      `/applications/job/${jobId}`
    ),

  getById: (id: string) =>
    apiClient.get<{ success: boolean; application: Application }>(`/applications/${id}`),

  updateStatus: (
    id: string,
    payload: {
      status?: string;
      interviewDate?: string;
      interviewMode?: string;
      interviewLink?: string;
      recruiterNotes?: string;
    }
  ) =>
    apiClient.put<{ success: boolean; application: Application; message: string }>(
      `/applications/${id}/status`,
      payload
    ),

  withdraw: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/applications/${id}`),
};

export const companiesApi = {
  list: (params: Record<string, string | undefined> = {}) =>
    apiClient.get<{ success: boolean; companies: Company[] }>('/companies', { params }),

  myCompanies: () => apiClient.get<{ success: boolean; companies: Company[] }>('/companies/my'),

  getById: (id: string) =>
    apiClient.get<{ success: boolean; company: Company; jobs: Job[] }>(`/companies/${id}`),

  create: (formData: FormData) =>
    apiClient.post<{ success: boolean; company: Company; message: string }>(
      '/companies',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  update: (id: string, formData: FormData) =>
    apiClient.put<{ success: boolean; company: Company; message: string }>(
      `/companies/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  remove: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/companies/${id}`),
};

export const savedJobsApi = {
  list: () => apiClient.get<{ success: boolean; savedJobs: SavedJobItem[] }>('/saved-jobs'),

  toggle: (jobId: string) =>
    apiClient.post<{ success: boolean; saved: boolean; message: string }>(`/saved-jobs/${jobId}`),

  remove: (jobId: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/saved-jobs/${jobId}`),
};

export const notificationsApi = {
  list: () =>
    apiClient.get<{ success: boolean; notifications: NotificationItem[]; unreadCount: number }>(
      '/notifications'
    ),

  markRead: (id: string) =>
    apiClient.put<{ success: boolean; notification: NotificationItem }>(
      `/notifications/${id}/read`
    ),

  markAllRead: () => apiClient.put<{ success: boolean }>('/notifications/read-all'),

  remove: (id: string) => apiClient.delete<{ success: boolean }>(`/notifications/${id}`),
};

export const adminApi = {
  stats: () => apiClient.get<{ success: boolean } & AdminDashboardData>('/admin/stats'),

  users: (params: Record<string, string | undefined> = {}) =>
    apiClient.get<{ success: boolean; users: User[] }>('/admin/users', { params }),

  toggleUserStatus: (id: string) =>
    apiClient.put<{ success: boolean; user: User; message: string }>(
      `/admin/users/${id}/toggle-status`
    ),

  deleteUser: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/admin/users/${id}`),

  jobs: (params: Record<string, string | undefined> = {}) =>
    apiClient.get<{ success: boolean; jobs: Job[] }>('/admin/jobs', { params }),

  updateJobStatus: (id: string, status: string) =>
    apiClient.put<{ success: boolean; job: Job; message: string }>(`/admin/jobs/${id}/status`, {
      status,
    }),

  deleteJob: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/admin/jobs/${id}`),

  companies: () => apiClient.get<{ success: boolean; companies: Company[] }>('/admin/companies'),

  applications: () =>
    apiClient.get<{ success: boolean; applications: Application[] }>('/admin/applications'),
};
