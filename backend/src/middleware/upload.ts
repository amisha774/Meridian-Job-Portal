import multer from 'multer';
import path from 'node:path';

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const PDF_MIME_TYPES = new Set(['application/pdf']);

const storage = multer.memoryStorage();

export const uploadImage = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (IMAGE_MIME_TYPES.has(file.mimetype) && ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WEBP image files up to 3MB are allowed.'));
    }
  },
});

export const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (PDF_MIME_TYPES.has(file.mimetype) && ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF resumes up to 5MB are allowed.'));
    }
  },
});

export const uploadProfileFiles = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === 'profileImage') {
      if (IMAGE_MIME_TYPES.has(file.mimetype) && ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Profile image must be JPG, PNG, or WEBP (max 3MB).'));
      }
      return;
    }
    if (file.fieldname === 'resume') {
      if (PDF_MIME_TYPES.has(file.mimetype) && ext === '.pdf') {
        cb(null, true);
      } else {
        cb(new Error('Resume must be a PDF file (max 5MB).'));
      }
      return;
    }
    cb(new Error('Unexpected upload field.'));
  },
});
