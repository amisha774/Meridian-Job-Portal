import { Router } from 'express';
import {
  applyToJob,
  getApplicationById,
  getJobApplications,
  getMyApplications,
  getRecruiterApplications,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/applicationController.ts';
import { authorize, protect } from '../middleware/auth.ts';
import { uploadResume } from '../middleware/upload.ts';

const router = Router();

router.get('/my', protect, authorize('jobseeker'), getMyApplications);
router.get('/recruiter', protect, authorize('recruiter', 'admin'), getRecruiterApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplications);
router.get('/:id', protect, getApplicationById);
router.post('/:jobId', protect, authorize('jobseeker'), uploadResume.single('resume'), applyToJob);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.delete('/:id', protect, authorize('jobseeker', 'admin'), withdrawApplication);

export default router;
