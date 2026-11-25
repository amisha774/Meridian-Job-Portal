import { Router } from 'express';
import { body } from 'express-validator';
import {
  createJob,
  deleteJob,
  getCategories,
  getJobById,
  getJobs,
  getRecommendedJobs,
  getRecruiterJobs,
  reportJob,
  searchJobs,
  updateJob,
} from '../controllers/jobController.ts';
import { authorize, optionalAuth, protect } from '../middleware/auth.ts';
import { handleValidationErrors } from '../middleware/validate.ts';

const router = Router();

router.get('/', getJobs);
router.get('/search', searchJobs);
router.get('/categories', getCategories);
router.get('/recommendations', protect, authorize('jobseeker'), getRecommendedJobs);
router.get('/my', protect, authorize('recruiter', 'admin'), getRecruiterJobs);
router.get('/:id', optionalAuth, getJobById);

router.post(
  '/',
  protect,
  authorize('recruiter', 'admin'),
  [
    body('title').trim().isLength({ min: 3, max: 140 }).withMessage('Job title must be 3–140 characters.'),
    body('description').trim().isLength({ min: 20 }).withMessage('Job description must be at least 20 characters.'),
    body('location').trim().notEmpty().withMessage('Location is required.'),
    body('category').trim().notEmpty().withMessage('Category is required.'),
    body('jobType')
      .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'])
      .withMessage('Invalid job type.'),
    body('workMode')
      .isIn(['Remote', 'Hybrid', 'On-site'])
      .withMessage('Invalid work mode.'),
    body('experience')
      .isIn(['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Executive'])
      .withMessage('Invalid experience level.'),
    body('salary.min').isNumeric().withMessage('Minimum salary must be a number.'),
    body('salary.max').isNumeric().withMessage('Maximum salary must be a number.'),
    body('deadline').notEmpty().withMessage('Application deadline is required.'),
    handleValidationErrors,
  ],
  createJob
);

router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);
router.post('/:id/report', protect, reportJob);

export default router;
