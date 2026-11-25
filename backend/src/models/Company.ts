import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  website?: string;
  location: string;
  industry: string;
  size?: string;
  foundedYear?: number;
  recruiter: mongoose.Types.ObjectId;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Company description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    logo: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Company location is required'],
      trim: true,
      index: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
      index: true,
    },
    size: {
      type: String,
      trim: true,
      default: '50-200 employees',
    },
    foundedYear: {
      type: Number,
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

companySchema.index({ name: 'text', description: 'text', industry: 'text', location: 'text' });

export const Company = mongoose.model<ICompany>('Company', companySchema);
