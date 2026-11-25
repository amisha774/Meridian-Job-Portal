import { Router } from 'express';
import { body } from 'express-validator';
import {
  getHomeData,
  submitContactMessage,
  subscribeNewsletter,
} from '../controllers/publicController.ts';
import { handleValidationErrors } from '../middleware/validate.ts';

const router = Router();

router.get('/home', getHomeData);
router.post('/newsletter', subscribeNewsletter);
router.post(
  '/contact',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('subject').trim().isLength({ min: 3 }).withMessage('Subject is required.'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters.'),
    handleValidationErrors,
  ],
  submitContactMessage
);

export default router;
