import mongoose, { Document, Schema } from 'mongoose';

export interface ISalary {
  min: number;
  max: number;
  currency: string;
  period: 'yearly' | 'monthly' | 'hourly';
}

export interface IJobReport {
  reporter: mongoose.Types.ObjectId;
  reason: string;
  createdAt: Date;
}

export interface IJob extends Document {
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  company: mongoose.Types.ObjectId;
  recruiter: mongoose.Types.ObjectId;
  location: string;
  salary: ISalary;
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance';
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  experience: 'Entry Level' | 'Mid Level' | 'Senior' | 'Lead' | 'Executive';
  skills: string[];
  vacancies: number;
  deadline: Date;
  category: string;
  status: 'active' | 'closed' | 'draft' | 'flagged';
  isFeatured: boolean;
  applicantCount: number;
  reports: IJobReport[];
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [140, 'Job title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      index: true,
    },
    salary: {
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'USD' },
      period: { type: String, enum: ['yearly', 'monthly', 'hourly'], default: 'yearly' },
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
      required: true,
      index: true,
    },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      required: true,
      index: true,
    },
    experience: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Executive'],
      required: true,
      index: true,
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    vacancies: {
      type: Number,
      default: 1,
      min: 1,
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft', 'flagged'],
      default: 'active',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    applicantCount: {
      type: Number,
      default: 0,
    },
    reports: [
      {
        reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reason: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ title: 'text', description: 'text', skills: 'text', location: 'text', category: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });

export const Job = mongoose.model<IJob>('Job', jobSchema);
