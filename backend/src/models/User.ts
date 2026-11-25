import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IExperienceItem {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface IEducationItem {
  degree: string;
  institution: string;
  field?: string;
  year: string;
}

export interface IResumeAnalysis {
  score: number;
  detectedSkills: string[];
  sectionsFound: string[];
  wordCount: number;
  suggestions: string[];
  analyzedAt: Date;
}

export interface IResumeInfo {
  url: string;
  originalName: string;
  size?: number;
  uploadedAt?: Date;
  analysis?: IResumeAnalysis;
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'jobseeker' | 'recruiter' | 'admin';
  profileImage?: string;
  headline?: string;
  bio?: string;
  location?: string;
  skills: string[];
  experience: IExperienceItem[];
  education: IEducationItem[];
  resume?: IResumeInfo;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const experienceSchema = new Schema<IExperienceItem>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    startDate: { type: String, required: true, trim: true },
    endDate: { type: String, trim: true },
    current: { type: Boolean, default: false },
    description: { type: String, trim: true },
  },
  { _id: false }
);

const educationSchema = new Schema<IEducationItem>(
  {
    degree: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    field: { type: String, trim: true },
    year: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['jobseeker', 'recruiter', 'admin'],
      default: 'jobseeker',
      index: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    headline: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: [experienceSchema],
      default: [],
    },
    education: {
      type: [educationSchema],
      default: [],
    },
    resume: {
      url: { type: String, default: '' },
      originalName: { type: String, default: '' },
      size: { type: Number, default: 0 },
      uploadedAt: { type: Date },
      analysis: {
        score: { type: Number, default: 0 },
        detectedSkills: { type: [String], default: [] },
        sectionsFound: { type: [String], default: [] },
        wordCount: { type: Number, default: 0 },
        suggestions: { type: [String], default: [] },
        analyzedAt: { type: Date },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ skills: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
