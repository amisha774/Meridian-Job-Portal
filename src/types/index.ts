export type UserRole = 'jobseeker' | 'recruiter' | 'admin';

export interface ExperienceItem {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  field?: string;
  year: string;
}

export interface ResumeAnalysis {
  score: number;
  detectedSkills: string[];
  sectionsFound: string[];
  wordCount: number;
  suggestions: string[];
  analyzedAt?: string;
}

export interface ResumeInfo {
  url: string;
  originalName: string;
  size?: number;
  uploadedAt?: string;
  analysis?: ResumeAnalysis;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  profileImage?: string;
  headline?: string;
  bio?: string;
  location?: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  resume?: ResumeInfo;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  website?: string;
  location: string;
  industry: string;
  size?: string;
  foundedYear?: number;
  recruiter: string | User;
  isVerified: boolean;
  openJobsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance';
export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';
export type ExperienceLevel = 'Entry Level' | 'Mid Level' | 'Senior' | 'Lead' | 'Executive';
export type JobStatus = 'active' | 'closed' | 'draft' | 'flagged';

export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  company: Company;
  recruiter: string | User;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'yearly' | 'monthly' | 'hourly';
  };
  jobType: JobType;
  workMode: WorkMode;
  experience: ExperienceLevel;
  skills: string[];
  vacancies: number;
  deadline: string;
  category: string;
  status: JobStatus;
  isFeatured: boolean;
  applicantCount: number;
  reports?: Array<{ reporter: string; reason: string; createdAt: string }>;
  matchScore?: number;
  matchingSkills?: string[];
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'pending'
  | 'reviewed'
  | 'shortlisted'
  | 'interview'
  | 'rejected'
  | 'hired'
  | 'withdrawn';

export interface Application {
  _id: string;
  job: Job;
  applicant: User;
  recruiter: string | User;
  resume: {
    url: string;
    originalName: string;
  };
  coverLetter: string;
  status: ApplicationStatus;
  interviewDate?: string;
  interviewMode?: 'Video' | 'Phone' | 'On-site';
  interviewLink?: string;
  recruiterNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedJobItem {
  _id: string;
  user: string;
  job: Job;
  savedAt: string;
}

export interface NotificationItem {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'application' | 'status_update' | 'interview' | 'job_alert' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminDashboardData {
  stats: {
    totalUsers: number;
    totalSeekers: number;
    totalRecruiters: number;
    totalCompanies: number;
    totalJobs: number;
    activeJobs: number;
    flaggedJobs: number;
    totalApplications: number;
  };
  analytics: {
    jobsByCategory: Array<{ category: string; count: number }>;
    applicationsByStatus: Array<{ status: string; count: number }>;
    userBreakdown: Array<{ role: string; count: number }>;
  };
  recentUsers: User[];
  recentJobs: Job[];
}
