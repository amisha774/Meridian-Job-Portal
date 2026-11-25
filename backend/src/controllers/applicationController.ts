import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { Application } from '../models/Application.ts';
import { Job } from '../models/Job.ts';
import { User } from '../models/User.ts';
import { sendEmail } from '../services/emailService.ts';
import { createAndEmitNotification } from '../services/notificationService.ts';
import { uploadFileBuffer } from '../services/uploadService.ts';

export async function applyToJob(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId).populate('company', 'name');
    if (!job || job.status !== 'active') {
      res.status(404).json({
        success: false,
        message: 'This job listing is no longer accepting applications.',
      });
      return;
    }

    const existing = await Application.findOne({
      job: job._id,
      applicant: req.user!._id,
    });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'You have already applied for this position.',
      });
      return;
    }

    let resumePayload = {
      url: req.user!.resume?.url || '',
      originalName: req.user!.resume?.originalName || '',
    };

    if (req.file) {
      const uploaded = await uploadFileBuffer(req.file, 'resumes');
      resumePayload = { url: uploaded.url, originalName: uploaded.originalName };
    }

    if (!resumePayload.url) {
      res.status(400).json({
        success: false,
        message: 'Please upload a PDF resume or add one to your profile before applying.',
      });
      return;
    }

    const application = await Application.create({
      job: job._id,
      applicant: req.user!._id,
      recruiter: job.recruiter,
      resume: resumePayload,
      coverLetter: coverLetter || '',
      status: 'pending',
    });

    await Job.findByIdAndUpdate(job._id, { $inc: { applicantCount: 1 } });

    const companyName = (job.company as any)?.name || 'your company';
    await createAndEmitNotification({
      userId: job.recruiter,
      title: 'New Candidate Application',
      message: `${req.user!.fullName} applied for ${job.title} at ${companyName}.`,
      type: 'application',
      link: `/recruiter/applicants?jobId=${job._id.toString()}`,
    });

    const recruiterUser = await User.findById(job.recruiter).select('email fullName');
    if (recruiterUser?.email) {
      await sendEmail({
        to: recruiterUser.email,
        subject: `New application for ${job.title}`,
        html: `<p>Hi ${recruiterUser.fullName},</p><p><strong>${req.user!.fullName}</strong> applied for <strong>${job.title}</strong>.</p>`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      application,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyApplications(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const applications = await Application.find({ applicant: req.user!._id })
      .populate({
        path: 'job',
        select: 'title location salary jobType workMode category status deadline company',
        populate: { path: 'company', select: 'name logo location industry' },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, applications });
  } catch (err) {
    next(err);
  }
}

export async function getRecruiterApplications(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filter: Record<string, any> = { recruiter: req.user!._id };
    if (req.query.jobId && req.query.jobId !== 'all') {
      filter.job = req.query.jobId;
    }
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    const applications = await Application.find(filter)
      .populate({
        path: 'job',
        select: 'title location jobType workMode company',
        populate: { path: 'company', select: 'name logo' },
      })
      .populate('applicant', 'fullName email phone headline location profileImage skills resume')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, applications });
  } catch (err) {
    next(err);
  }
}

export async function getJobApplications(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job listing not found.' });
      return;
    }

    if (req.user!.role !== 'admin' && job.recruiter.toString() !== req.user!._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view applicants for this job.',
      });
      return;
    }

    const applications = await Application.find({ job: job._id })
      .populate('applicant', 'fullName email phone headline location profileImage skills experience education resume')
      .populate('job', 'title location jobType')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, applications });
  } catch (err) {
    next(err);
  }
}

export async function getApplicationById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo location' },
      })
      .populate(
        'applicant',
        'fullName email phone headline bio location profileImage skills experience education resume'
      );

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    const isOwner =
      application.applicant._id.toString() === req.user!._id.toString() ||
      application.recruiter.toString() === req.user!._id.toString() ||
      req.user!.role === 'admin';

    if (!isOwner) {
      res.status(403).json({ success: false, message: 'Not authorized to view this application.' });
      return;
    }

    res.json({ success: true, application });
  } catch (err) {
    next(err);
  }
}

export async function updateApplicationStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status, interviewDate, interviewMode, interviewLink, recruiterNotes } = req.body;
    const application = await Application.findById(req.params.id).populate('job', 'title');

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    if (
      req.user!.role !== 'admin' &&
      application.recruiter.toString() !== req.user!._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this application.',
      });
      return;
    }

    if (status) application.status = status;
    if (interviewDate) application.interviewDate = new Date(interviewDate);
    if (interviewMode) application.interviewMode = interviewMode;
    if (typeof interviewLink === 'string') application.interviewLink = interviewLink.trim();
    if (typeof recruiterNotes === 'string') application.recruiterNotes = recruiterNotes.trim();

    await application.save();

    const jobTitle = (application.job as any)?.title || 'your application';
    const isInterview = application.status === 'interview' && application.interviewDate;
    const formattedDate = isInterview
      ? new Date(application.interviewDate!).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '';

    await createAndEmitNotification({
      userId: application.applicant,
      title: isInterview
        ? `Interview Scheduled: ${jobTitle}`
        : `Application Status Updated: ${jobTitle}`,
      message: isInterview
        ? `Your ${application.interviewMode || 'Video'} interview is scheduled for ${formattedDate}.`
        : `Your application status was updated to ${application.status}.`,
      type: isInterview ? 'interview' : 'status_update',
      link: '/seeker/applications',
    });

    const candidate = await User.findById(application.applicant).select('email fullName');
    if (candidate?.email) {
      await sendEmail({
        to: candidate.email,
        subject: isInterview
          ? `Interview Scheduled for ${jobTitle}`
          : `Application Update: ${jobTitle}`,
        html: `<p>Hi ${candidate.fullName},</p><p>Your application for <strong>${jobTitle}</strong> is now marked <strong>${application.status}</strong>${isInterview ? ` on ${formattedDate}` : ''}.</p>`,
      });
    }

    res.json({
      success: true,
      message: 'Application updated successfully.',
      application,
    });
  } catch (err) {
    next(err);
  }
}

export async function withdrawApplication(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    if (
      req.user!.role !== 'admin' &&
      application.applicant.toString() !== req.user!._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application.',
      });
      return;
    }

    await Promise.all([
      Job.findByIdAndUpdate(application.job, { $inc: { applicantCount: -1 } }),
      application.deleteOne(),
    ]);

    res.json({ success: true, message: 'Application withdrawn successfully.' });
  } catch (err) {
    next(err);
  }
}
