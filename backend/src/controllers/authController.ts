import { Response, NextFunction } from 'express';
import { AuthRequest, generateToken } from '../middleware/auth.ts';
import { User } from '../models/User.ts';
import { analyzeResumeBuffer } from '../services/resumeAnalyzer.ts';
import { uploadFileBuffer } from '../services/uploadService.ts';

function sanitizeUser(user: any) {
  const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
}

function setTokenCookie(res: Response, token: string): void {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fullName, email, password, phone, role } = req.body;
    const normalizedRole = role === 'recruiter' ? 'recruiter' : 'jobseeker';

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone: phone || '',
      role: normalizedRole,
    });

    const token = generateToken(user);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an administrator.',
      });
      return;
    }

    const token = generateToken(user);
    setTokenCookie(res, token);

    res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: AuthRequest, res: Response): Promise<void> {
  res.clearCookie('token');
  res.json({ success: true, message: 'Signed out successfully.' });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  res.json({
    success: true,
    user: sanitizeUser(req.user),
  });
}

export async function updateProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { fullName, phone, headline, bio, location, skills, experience, education } = req.body;

    if (typeof fullName === 'string' && fullName.trim()) user.fullName = fullName.trim();
    if (typeof phone === 'string') user.phone = phone.trim();
    if (typeof headline === 'string') user.headline = headline.trim();
    if (typeof bio === 'string') user.bio = bio.trim();
    if (typeof location === 'string') user.location = location.trim();

    if (skills !== undefined) {
      const parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
      if (Array.isArray(parsedSkills)) {
        user.skills = parsedSkills.map((s) => String(s).trim()).filter(Boolean);
      }
    }

    if (experience !== undefined) {
      const parsedExp = typeof experience === 'string' ? JSON.parse(experience) : experience;
      if (Array.isArray(parsedExp)) {
        user.experience = parsedExp;
      }
    }

    if (education !== undefined) {
      const parsedEdu = typeof education === 'string' ? JSON.parse(education) : education;
      if (Array.isArray(parsedEdu)) {
        user.education = parsedEdu;
      }
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (files?.profileImage?.[0]) {
      const uploadedAvatar = await uploadFileBuffer(files.profileImage[0], 'avatars');
      user.profileImage = uploadedAvatar.url;
    }

    if (files?.resume?.[0]) {
      const resumeFile = files.resume[0];
      const uploadedResume = await uploadFileBuffer(resumeFile, 'resumes');
      const analysis = analyzeResumeBuffer(resumeFile.buffer, user.skills);
      user.resume = {
        url: uploadedResume.url,
        originalName: uploadedResume.originalName,
        size: uploadedResume.size,
        uploadedAt: new Date(),
        analysis,
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!._id).select('+password');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}
