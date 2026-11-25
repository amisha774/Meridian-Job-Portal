import { Router } from 'express';
import {
  deleteAdminJob,
  deleteAdminUser,
  getAdminApplications,
  getAdminCompanies,
  getAdminJobs,
  getAdminStats,
  getAdminUsers,
  toggleUserStatus,
  updateAdminJobStatus,
} from '../controllers/adminController.ts';
import { authorize, protect } from '../middleware/auth.ts';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteAdminUser);
router.get('/jobs', getAdminJobs);
router.put('/jobs/:id/status', updateAdminJobStatus);
router.delete('/jobs/:id', deleteAdminJob);
router.get('/companies', getAdminCompanies);
router.get('/applications', getAdminApplications);

export default router;
