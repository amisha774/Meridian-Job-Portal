import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { Job } from '../models/Job.ts';
import { SavedJob } from '../models/SavedJob.ts';

export async function getSavedJobs(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const saved = await SavedJob.find({ user: req.user!._id })
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo location industry isVerified' },
      })
      .sort({ savedAt: -1 })
      .lean();

    const valid = saved.filter((item) => Boolean(item.job));
    res.json({ success: true, savedJobs: valid });
  } catch (err) {
    next(err);
  }
}

export async function toggleSaveJob(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job listing not found.' });
      return;
    }

    const existing = await SavedJob.findOne({ user: req.user!._id, job: jobId });
    if (existing) {
      await existing.deleteOne();
      res.json({ success: true, saved: false, message: 'Job removed from saved list.' });
      return;
    }

    await SavedJob.create({ user: req.user!._id, job: jobId });
    res.status(201).json({ success: true, saved: true, message: 'Job saved to bookmarks.' });
  } catch (err) {
    next(err);
  }
}

export async function removeSavedJob(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await SavedJob.findOneAndDelete({ user: req.user!._id, job: req.params.jobId });
    res.json({ success: true, saved: false, message: 'Bookmark removed.' });
  } catch (err) {
    next(err);
  }
}
