import mongoose, { Document, Schema } from 'mongoose';

export type ApplicationStatus =
  | 'pending'
  | 'reviewed'
  | 'shortlisted'
  | 'interview'
  | 'rejected'
  | 'hired'
  | 'withdrawn';

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  recruiter: mongoose.Types.ObjectId;
  resume: {
    url: string;
    originalName: string;
  };
  coverLetter: string;
  status: ApplicationStatus;
  interviewDate?: Date;
  interviewMode?: 'Video' | 'Phone' | 'On-site';
  interviewLink?: string;
  recruiterNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resume: {
      url: { type: String, required: true },
      originalName: { type: String, required: true },
    },
    coverLetter: {
      type: String,
      trim: true,
      default: '',
      maxlength: [4000, 'Cover letter cannot exceed 4000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'interview', 'rejected', 'hired', 'withdrawn'],
      default: 'pending',
      index: true,
    },
    interviewDate: {
      type: Date,
    },
    interviewMode: {
      type: String,
      enum: ['Video', 'Phone', 'On-site'],
    },
    interviewLink: {
      type: String,
      trim: true,
    },
    recruiterNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications from the same candidate for the same job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
