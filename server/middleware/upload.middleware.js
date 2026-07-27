import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const storage = multer.memoryStorage();

// 1. Resume Filter & Validation (PDF only)
const resumeFileFilter = (_req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = (file.originalname || '').toLowerCase().endsWith('.pdf');

  if (isPdfMime || isPdfExt) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF resumes are allowed.', 400), false);
  }
};

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max size limit
  },
  fileFilter: resumeFileFilter,
});

// 2. Avatar Filter & Validation (JPG, JPEG, PNG, WEBP only)
const avatarFileFilter = (_req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ext = (file.originalname || '').toLowerCase().split('.').pop();
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];

  if (allowedMimeTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPG, JPEG, PNG, or WEBP image formats are allowed for avatars.', 400), false);
  }
};

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB max size limit
  },
  fileFilter: avatarFileFilter,
});

// Legacy default export for backwards compatibility
export const upload = uploadResume;
