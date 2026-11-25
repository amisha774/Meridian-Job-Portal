import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { Company } from '../models/Company.ts';
import { Job } from '../models/Job.ts';
import { SavedJob } from '../models/SavedJob.ts';
import { Application } from '../models/Application.ts';

function buildJobFilterQuery(query: Record<string, any>) {
  const filter: Record<string, any> = { status: 'active' };

  if (query.q && String(query.q).trim()) {
    const regex = new RegExp(String(query.q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { title: regex },
      { description: regex },
      { category: regex },
      { location: regex },
      { skills: { $in: [regex] } },
    ];
  }

  if (query.location && String(query.location).trim()) {
    const locRegex = new RegExp(
      String(query.location).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'i'
    );
    filter.location = locRegex;
  }

  if (query.category && query.category !== 'all') {
    filter.category = String(query.category);
  }

  if (query.jobType && query.jobType !== 'all') {
    filter.jobType = String(query.jobType);
  }

  if (query.workMode && query.workMode !== 'all') {
    filter.workMode = String(query.workMode);
  }

  if (query.experience && query.experience !== 'all') {
    filter.experience = String(query.experience);
  }

  if (query.salaryMin && !Number.isNaN(Number(query.salaryMin))) {
    filter['salary.max'] = { $gte: Number(query.salaryMin) };
  }

  if (query.salaryMax && !Number.isNaN(Number(query.salaryMax))) {
    filter['salary.min'] = { $lte: Number(query.salaryMax) };
  }

  if (query.companyId) {
    filter.company = query.companyId;
  }

  if (query.featured === 'true') {
    filter.isFeatured = true;
  }

  return filter;
}

export async function getJobs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 9));
    const skip = (page - 1) * limit;

    const filter = buildJobFilterQuery(req.query);

    let sortObj: Record<string, 1 | -1> = { isFeatured: -1, createdAt: -1 };
    if (req.query.sort === 'salary_desc') sortObj = { 'salary.max': -1, createdAt: -1 };
    if (req.query.sort === 'salary_asc') sortObj = { 'salary.min': 1, createdAt: -1 };
    if (req.query.sort === 'newest') sortObj = { createdAt: -1 };
    if (req.query.sort === 'deadline') sortObj = { deadline: 1 };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('company', 'name logo location industry isVerified')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ]);

    res.json({
      success: true,
      jobs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function searchJobs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  return getJobs(req, res, next);
}

export async function getCategories(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: '$_id', count: 1 } },
    ]);

    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
}

export async function getRecommendedJobs(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userSkills = Array.from(
      new Set([
        ...(req.user?.skills || []),
        ...(req.user?.resume?.analysis?.detectedSkills || []),
      ])
    ).map((s) => s.toLowerCase());

    const activeJobs = await Job.find({ status: 'active' })
      .populate('company', 'name logo location industry isVerified')
      .sort({ createdAt: -1 })
      .lean();

    const scored = activeJobs.map((job) => {
      const jobSkills = (job.skills || []).map((s) => s.toLowerCase());
      const matchingSkills = (job.skills || []).filter((skill) =>
        userSkills.some(
          (us) => us === skill.toLowerCase() || us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us)
        )
      );
      const matchScore =
        jobSkills.length > 0 && userSkills.length > 0
          ? Math.round((matchingSkills.length / jobSkills.length) * 100)
          : 0;

      return {
        ...job,
        matchScore,
        matchingSkills,
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore || (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

    res.json({
      success: true,
      jobs: scored.slice(0, 6),
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecruiterJobs(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const jobs = await Job.find({ recruiter: req.user!._id })
      .populate('company', 'name logo location industry')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, jobs });
  } catch (err) {
    next(err);
  }
}

export async function getJobById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name description logo banner website location industry size foundedYear isVerified')
      .populate('recruiter', 'fullName headline profileImage');

    if (!job) {
      res.status(404).json({ success: false, message: 'Job listing not found.' });
      return;
    }

    let isSaved = false;
    let hasApplied = false;
    let existingApplicationId: string | null = null;

    if (req.user) {
      const [saved, app] = await Promise.all([
        SavedJob.findOne({ user: req.user._id, job: job._id }).lean(),
        Application.findOne({ applicant: req.user._id, job: job._id }).lean(),
      ]);
      isSaved = Boolean(saved);
      hasApplied = Boolean(app);
      existingApplicationId = app?._id?.toString() || null;
    }

    res.json({
      success: true,
      job,
      meta: { isSaved, hasApplied, existingApplicationId },
    });
  } catch (err) {
    next(err);
  }
}

export async function createJob(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      title,
      description,
      requirements,
      benefits,
      company,
      location,
      salary,
      jobType,
      workMode,
      experience,
      skills,
      vacancies,
      deadline,
      category,
      status,
      isFeatured,
    } = req.body;

    let companyDoc = company
      ? await Company.findById(company)
      : await Company.findOne({ recruiter: req.user!._id });

    if (!companyDoc) {
      res.status(400).json({
        success: false,
        message: 'Please create a company profile before posting a job.',
      });
      return;
    }

    if (req.user!.role !== 'admin' && companyDoc.recruiter.toString() !== req.user!._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'You can only post jobs for your own company.',
      });
      return;
    }

    const job = await Job.create({
      title,
      description,
      requirements: Array.isArray(requirements) ? requirements : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      company: companyDoc._id,
      recruiter: req.user!._id,
      location,
      salary,
      jobType,
      workMode,
      experience,
      skills: Array.isArray(skills) ? skills : [],
      vacancies: Number(vacancies) || 1,
      deadline: new Date(deadline),
      category,
      status: status || 'active',
      isFeatured: Boolean(isFeatured),
    });

    const populated = await job.populate('company', 'name logo location industry');
    res.status(201).json({
      success: true,
      message: 'Job listing published successfully.',
      job: populated,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateJob(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job listing not found.' });
      return;
    }

    if (req.user!.role !== 'admin' && job.recruiter.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to update this job.' });
      return;
    }

    const allowedFields = [
      'title',
      'description',
      'requirements',
      'benefits',
      'location',
      'salary',
      'jobType',
      'workMode',
      'experience',
      'skills',
      'vacancies',
      'deadline',
      'category',
      'status',
      'isFeatured',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        (job as any)[field] = field === 'deadline' ? new Date(req.body[field]) : req.body[field];
      }
    }

    await job.save();
    const populated = await job.populate('company', 'name logo location industry');

    res.json({
      success: true,
      message: 'Job listing updated successfully.',
      job: populated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteJob(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job listing not found.' });
      return;
    }

    if (req.user!.role !== 'admin' && job.recruiter.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this job.' });
      return;
    }

    await Promise.all([
      Application.deleteMany({ job: job._id }),
      SavedJob.deleteMany({ job: job._id }),
      job.deleteOne(),
    ]);

    res.json({ success: true, message: 'Job listing removed successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function reportJob(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { reason } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job listing not found.' });
      return;
    }

    const alreadyReported = job.reports.some(
      (r) => r.reporter.toString() === req.user!._id.toString()
    );
    if (alreadyReported) {
      res.status(409).json({ success: false, message: 'You have already reported this job.' });
      return;
    }

    job.reports.push({
      reporter: req.user!._id,
      reason: String(reason || 'Inappropriate or misleading listing').trim(),
      createdAt: new Date(),
    });

    if (job.reports.length >= 1) {
      job.status = 'flagged';
    }

    await job.save();
    res.json({ success: true, message: 'Report submitted for administrator review.' });
  } catch (err) {
    next(err);
  }
}
