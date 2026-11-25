import { Router } from 'express';
import { body } from 'express-validator';
import {
  changePassword,
  getMe,
  login,
  logout,
  register,
  updateProfile,
} from '../controllers/authController.ts';
import { protect } from '../middleware/auth.ts';
import { uploadProfileFiles } from '../middleware/upload.ts';
import { handleValidationErrors } from '../middleware/validate.ts';

const router = Router();

router.post(
  '/register',
  [
    body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2–100 characters.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('role').optional().isIn(['jobseeker', 'recruiter']).withMessage('Role must be jobseeker or recruiter.'),
    handleValidationErrors,
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
    handleValidationErrors,
  ],
  login
);

router.post('/logout', logout);
router.get('/me', protect, getMe);

router.put(
  '/profile',
  protect,
  uploadProfileFiles.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
  ]),
  updateProfile
);

router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.'),
    handleValidationErrors,
  ],
  changePassword
);

export default router;
