import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { Company } from '../models/Company.ts';
import { Job } from '../models/Job.ts';
import { uploadFileBuffer } from '../services/uploadService.ts';

export async function createCompany(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, description, website, location, industry, size, foundedYear } = req.body;

    let logoUrl = '';
    if (req.file) {
      const uploaded = await uploadFileBuffer(req.file, 'logos');
      logoUrl = uploaded.url;
    }

    const company = await Company.create({
      name,
      description,
      logo: logoUrl,
      website: website || '',
      location,
      industry,
      size: size || '50-200 employees',
      foundedYear: foundedYear ? Number(foundedYear) : undefined,
      recruiter: req.user!._id,
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      message: 'Company profile created successfully.',
      company,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCompanies(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filter: Record<string, any> = {};
    if (req.query.q && String(req.query.q).trim()) {
      const regex = new RegExp(
        String(req.query.q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );
      filter.$or = [{ name: regex }, { industry: regex }, { location: regex }, { description: regex }];
    }
    if (req.query.industry && req.query.industry !== 'all') {
      filter.industry = String(req.query.industry);
    }

    const companies = await Company.find(filter).sort({ createdAt: -1 }).lean();

    const jobCounts = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$company', openJobs: { $sum: 1 } } },
    ]);
    const countMap = new Map(jobCounts.map((item) => [item._id.toString(), item.openJobs]));

    const enriched = companies.map((company) => ({
      ...company,
      openJobsCount: countMap.get(company._id.toString()) || 0,
    }));

    res.json({ success: true, companies: enriched });
  } catch (err) {
    next(err);
  }
}

export async function getMyCompanies(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const companies = await Company.find({ recruiter: req.user!._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, companies });
  } catch (err) {
    next(err);
  }
}

export async function getCompanyById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const company = await Company.findById(req.params.id).lean();
    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found.' });
      return;
    }

    const openJobs = await Job.find({ company: company._id, status: 'active' })
      .populate('company', 'name logo location industry')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      company: { ...company, openJobsCount: openJobs.length },
      jobs: openJobs,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCompany(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found.' });
      return;
    }

    if (req.user!.role !== 'admin' && company.recruiter.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to update this company.' });
      return;
    }

    const { name, description, website, location, industry, size, foundedYear } = req.body;
    if (name !== undefined) company.name = name;
    if (description !== undefined) company.description = description;
    if (website !== undefined) company.website = website;
    if (location !== undefined) company.location = location;
    if (industry !== undefined) company.industry = industry;
    if (size !== undefined) company.size = size;
    if (foundedYear !== undefined) company.foundedYear = Number(foundedYear) || undefined;

    if (req.file) {
      const uploaded = await uploadFileBuffer(req.file, 'logos');
      company.logo = uploaded.url;
    }

    await company.save();
    res.json({
      success: true,
      message: 'Company profile updated successfully.',
      company,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteCompany(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found.' });
      return;
    }

    if (req.user!.role !== 'admin' && company.recruiter.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this company.' });
      return;
    }

    await Job.deleteMany({ company: company._id });
    await company.deleteOne();

    res.json({ success: true, message: 'Company and its job postings removed.' });
  } catch (err) {
    next(err);
  }
}
