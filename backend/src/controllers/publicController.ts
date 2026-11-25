import { NextFunction, Request, Response } from 'express';
import { Company } from '../models/Company.ts';
import { ContactMessage } from '../models/ContactMessage.ts';
import { Job } from '../models/Job.ts';
import { Newsletter } from '../models/Newsletter.ts';
import { User } from '../models/User.ts';

export async function getHomeData(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      featuredJobs,
      latestJobs,
      companies,
      categories,
      activeJobsCount,
      companiesCount,
      candidatesCount,
    ] = await Promise.all([
      Job.find({ status: 'active', isFeatured: true })
        .populate('company', 'name logo location industry isVerified')
        .sort({ createdAt: -1 })
        .limit(4)
        .lean(),
      Job.find({ status: 'active' })
        .populate('company', 'name logo location industry isVerified')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Company.find().sort({ createdAt: -1 }).limit(6).lean(),
      Job.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, name: '$_id', count: 1 } },
      ]),
      Job.countDocuments({ status: 'active' }),
      Company.countDocuments(),
      User.countDocuments({ role: 'jobseeker' }),
    ]);

    const jobCounts = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$company', openJobs: { $sum: 1 } } },
    ]);
    const countMap = new Map(jobCounts.map((c) => [c._id.toString(), c.openJobs]));

    const topCompanies = companies.map((c) => ({
      ...c,
      openJobsCount: countMap.get(c._id.toString()) || 0,
    }));

    res.json({
      success: true,
      featuredJobs,
      latestJobs,
      topCompanies,
      categories,
      stats: {
        activeJobsCount,
        companiesCount,
        candidatesCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function subscribeNewsletter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      return;
    }

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      res.json({ success: true, message: 'You are already subscribed to Meridian job digests.' });
      return;
    }

    await Newsletter.create({ email });
    res.status(201).json({
      success: true,
      message: 'Subscribed to weekly curated roles and hiring benchmarks.',
    });
  } catch (err) {
    next(err);
  }
}

export async function submitContactMessage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, subject, message } = req.body;
    await ContactMessage.create({ name, email, subject, message });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out. Our team will reply within 1 business day.',
    });
  } catch (err) {
    next(err);
  }
}
