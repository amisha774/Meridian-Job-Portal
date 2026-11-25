import { Router } from 'express';
import {
  getSavedJobs,
  removeSavedJob,
  toggleSaveJob,
} from '../controllers/savedJobController.ts';
import { authorize, protect } from '../middleware/auth.ts';

const router = Router();

router.use(protect, authorize('jobseeker'));
router.get('/', getSavedJobs);
router.post('/:jobId', toggleSaveJob);
router.delete('/:jobId', removeSavedJob);

export default router;
