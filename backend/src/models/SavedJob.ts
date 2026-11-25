import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedJob extends Document {
  user: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  savedAt: Date;
}

const savedJobSchema = new Schema<ISavedJob>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

export const SavedJob = mongoose.model<ISavedJob>('SavedJob', savedJobSchema);
