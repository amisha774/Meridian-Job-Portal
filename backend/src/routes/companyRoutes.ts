import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCompany,
  deleteCompany,
  getCompanies,
  getCompanyById,
  getMyCompanies,
  updateCompany,
} from '../controllers/companyController.ts';
import { authorize, protect } from '../middleware/auth.ts';
import { uploadImage } from '../middleware/upload.ts';
import { handleValidationErrors } from '../middleware/validate.ts';

const router = Router();

router.get('/', getCompanies);
router.get('/my', protect, authorize('recruiter', 'admin'), getMyCompanies);
router.get('/:id', getCompanyById);

router.post(
  '/',
  protect,
  authorize('recruiter', 'admin'),
  uploadImage.single('logo'),
  [
    body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Company name is required.'),
    body('description').trim().isLength({ min: 15 }).withMessage('Company description must be at least 15 characters.'),
    body('location').trim().notEmpty().withMessage('Company location is required.'),
    body('industry').trim().notEmpty().withMessage('Industry is required.'),
    handleValidationErrors,
  ],
  createCompany
);

router.put(
  '/:id',
  protect,
  authorize('recruiter', 'admin'),
  uploadImage.single('logo'),
  updateCompany
);

router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteCompany);

export default router;
