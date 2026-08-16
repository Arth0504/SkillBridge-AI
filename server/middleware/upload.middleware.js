import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const storage = multer.memoryStorage();

// Dangerous File Extensions Blacklist
const FORBIDDEN_EXTENSIONS = ['.exe', '.sh', '.bat', '.cmd', '.js', '.py', '.php', '.pl', '.cgi', '.jar', '.vbs'];

const isPathTraversalOrExecutable = (filename = '') => {
  const lower = filename.toLowerCase();
  if (lower.includes('..') || lower.includes('/') || lower.includes('\\')) return true;
  return FORBIDDEN_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

// 1. Resume Filter & Validation (PDF only)
const resumeFileFilter = (_req, file, cb) => {
  const originalName = file.originalname || '';
  if (isPathTraversalOrExecutable(originalName)) {
    return cb(new AppError('Invalid filename or unsupported executable file format.', 400), false);
  }

  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = originalName.toLowerCase().endsWith('.pdf');

  if (isPdfMime && isPdfExt) {
    cb(null, true);
  } else {
    cb(new AppError('Only valid PDF document format (.pdf) is allowed for resumes.', 400), false);
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
  const originalName = file.originalname || '';
  if (isPathTraversalOrExecutable(originalName)) {
    return cb(new AppError('Invalid filename or unsupported executable file format.', 400), false);
  }

  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ext = originalName.toLowerCase().split('.').pop();
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];

  if (allowedMimeTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Only valid JPG, JPEG, PNG, or WEBP image formats are allowed for avatars.', 400), false);
  }
};

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB max size limit
  },
  fileFilter: avatarFileFilter,
});

// 3. Logo Filter & Validation (JPG, JPEG, PNG, WEBP only)
const logoFileFilter = (_req, file, cb) => {
  const originalName = file.originalname || '';
  if (isPathTraversalOrExecutable(originalName)) {
    return cb(new AppError('Invalid filename or unsupported executable file format.', 400), false);
  }

  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ext = originalName.toLowerCase().split('.').pop();
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];

  if (allowedMimeTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Only valid JPG, JPEG, PNG, or WEBP image formats are allowed for company logos.', 400), false);
  }
};

export const uploadLogo = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB max size limit
  },
  fileFilter: logoFileFilter,
});

// Legacy default export for backwards compatibility
export const upload = uploadResume;
