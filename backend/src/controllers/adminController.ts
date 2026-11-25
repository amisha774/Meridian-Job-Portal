import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { Application } from '../models/Application.ts';
import { Company } from '../models/Company.ts';
import { Job } from '../models/Job.ts';
import { SavedJob } from '../models/SavedJob.ts';
import { User } from '../models/User.ts';

export async function getAdminStats(
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [
      totalUsers,
      totalSeekers,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      activeJobs,
      flaggedJobs,
      totalApplications,
      jobsByCategory,
      applicationsByStatus,
      recentUsers,
      recentJobs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'recruiter' }),
      Company.countDocuments(),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments({ status: 'flagged' }),
      Application.countDocuments(),
      Job.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, category: '$_id', count: 1 } },
      ]),
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
      ]),
      User.find().select('-password').sort({ createdAt: -1 }).limit(5).lean(),
      Job.find().populate('company', 'name').sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSeekers,
        totalRecruiters,
        totalCompanies,
        totalJobs,
        activeJobs,
        flaggedJobs,
        totalApplications,
      },
      analytics: {
        jobsByCategory,
        applicationsByStatus,
        userBreakdown: [
          { role: 'Job Seekers', count: totalSeekers },
          { role: 'Recruiters', count: totalRecruiters },
          { role: 'Admins', count: Math.max(0, totalUsers - totalSeekers - totalRecruiters) },
        ],
      },
      recentUsers,
      recentJobs,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filter: Record<string, any> = {};
    if (req.query.role && req.query.role !== 'all') {
      filter.role = req.query.role;
    }
    if (req.query.status === 'active') filter.isActive = true;
    if (req.query.status === 'blocked') filter.isActive = false;
    if (req.query.q && String(req.query.q).trim()) {
      const regex = new RegExp(
        String(req.query.q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );
      filter.$or = [{ fullName: regex }, { email: regex }, { location: regex }];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).lean();
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
}

export async function toggleUserStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.params.id === req.user!._id.toString()) {
      res.status(400).json({ success: false, message: 'You cannot suspend your own admin account.' });
      return;
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? 'User account activated.' : 'User account blocked.',
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.params.id === req.user!._id.toString()) {
      res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    await Promise.all([
      Application.deleteMany({ $or: [{ applicant: user._id }, { recruiter: user._id }] }),
      SavedJob.deleteMany({ user: user._id }),
      Job.deleteMany({ recruiter: user._id }),
      Company.deleteMany({ recruiter: user._id }),
      user.deleteOne(),
    ]);

    res.json({ success: true, message: 'User and associated records removed.' });
  } catch (err) {
    next(err);
  }
}

export async function getAdminJobs(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filter: Record<string, any> = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    if (req.query.reported === 'true') {
      filter['reports.0'] = { $exists: true };
    }
    if (req.query.q && String(req.query.q).trim()) {
      const regex = new RegExp(
        String(req.query.q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );
      filter.$or = [{ title: regex }, { category: regex }, { location: regex }];
    }

    const jobs = await Job.find(filter)
      .populate('company', 'name location')
      .populate('recruiter', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, jobs });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminJobStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status } = req.body;
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('company', 'name');

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found.' });
      return;
    }
    res.json({ success: true, message: `Job status updated to ${status}.`, job });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminJob(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found.' });
      return;
    }

    await Promise.all([
      Application.deleteMany({ job: job._id }),
      SavedJob.deleteMany({ job: job._id }),
      job.deleteOne(),
    ]);

    res.json({ success: true, message: 'Job removed by administrator.' });
  } catch (err) {
    next(err);
  }
}

export async function getAdminCompanies(
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const companies = await Company.find()
      .populate('recruiter', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, companies });
  } catch (err) {
    next(err);
  }
}

export async function getAdminApplications(
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const applications = await Application.find()
      .populate({
        path: 'job',
        select: 'title location company',
        populate: { path: 'company', select: 'name' },
      })
      .populate('applicant', 'fullName email')
      .populate('recruiter', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, applications });
  } catch (err) {
    next(err);
  }
}
