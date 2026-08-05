import { Candidate } from '../models/candidate.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/upload.service.js';

/**
 * Get Candidate Profile
 * @route GET /api/v1/candidate/profile
 */
export const getCandidateProfile = asyncHandler(async (req, res, _next) => {
  const candidate = await Candidate.findById(req.user._id);
  return sendResponse(res, 200, true, 'Candidate profile retrieved', { profile: candidate });
});

/**
 * Update Candidate Profile
 * @route PUT /api/v1/candidate/profile
 */
export const updateCandidateProfile = asyncHandler(async (req, res, _next) => {
  const allowedFields = [
    'fullName',
    'phone',
    'headline',
    'bio',
    'location',
    'skills',
    'experienceYears',
    'education',
    'experience',
    'projects',
    'certifications',
    'socialLinks',
    'resumeUrl',
    'resumeTemplate',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const candidate = await Candidate.findById(req.user._id);

  Object.assign(candidate, updates);

  // Check profile completion criteria (fullName, headline, location, skills array min 1, experienceYears)
  if (
    candidate.fullName &&
    candidate.headline &&
    candidate.location &&
    Array.isArray(candidate.skills) &&
    candidate.skills.length > 0
  ) {
    candidate.profileCompleted = true;
  }

  await candidate.save();

  return sendResponse(res, 200, true, 'Candidate profile updated successfully', { profile: candidate });
});

/**
 * Upload Candidate Resume PDF
 * @route POST /api/v1/candidate/profile/resume
 */
export const uploadResume = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please select a PDF document file to upload.', 400));
  }

  if (req.file.mimetype !== 'application/pdf') {
    return next(new AppError('Only PDF documents are accepted for resume uploads.', 400));
  }

  const candidate = await Candidate.findById(req.user._id);

  // Delete previous resume from Cloudinary if exists
  if (candidate.resumePublicId) {
    await deleteFromCloudinary(candidate.resumePublicId);
  }

  // Upload to Cloudinary under folder 'skillbridge/resumes'
  const uploadResult = await uploadToCloudinary(req.file.buffer, 'skillbridge/resumes', 'raw');

  candidate.resumeUrl = uploadResult.url;
  candidate.resumePublicId = uploadResult.publicId;
  await candidate.save();

  return sendResponse(res, 200, true, 'Resume uploaded successfully', {
    resumeUrl: candidate.resumeUrl,
    resumePublicId: candidate.resumePublicId,
  });
});

/**
 * Upload Candidate Avatar Image
 * @route POST /api/v1/candidate/profile/avatar
 */
export const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please select an image file to upload.', 400));
  }

  if (!req.file.mimetype.startsWith('image/')) {
    return next(new AppError('Only image files are accepted for avatar uploads.', 400));
  }

  const candidate = await Candidate.findById(req.user._id);

  // Delete previous avatar from Cloudinary if exists
  if (candidate.avatarPublicId) {
    await deleteFromCloudinary(candidate.avatarPublicId);
  }

  // Upload to Cloudinary under folder 'skillbridge/avatars'
  const uploadResult = await uploadToCloudinary(req.file.buffer, 'skillbridge/avatars', 'image');

  candidate.avatarUrl = uploadResult.url;
  candidate.avatarPublicId = uploadResult.publicId;
  await candidate.save();

  return sendResponse(res, 200, true, 'Avatar uploaded successfully', {
    avatarUrl: candidate.avatarUrl,
    avatarPublicId: candidate.avatarPublicId,
  });
});

/**
 * Get Public Candidate Profile (Unrestricted / Public View)
 * @route GET /api/v1/candidate/profile/public/:id
 */
export const getPublicCandidateProfile = asyncHandler(async (req, res, next) => {
  const candidate = await Candidate.findById(req.params.id).select(
    'fullName headline location bio avatarUrl skills experience education socialLinks resumeUrl createdAt'
  );

  if (!candidate || candidate.isDeleted) {
    return next(new AppError('Candidate profile not found or unavailable.', 404));
  }

  return sendResponse(res, 200, true, 'Candidate public profile retrieved', { candidate });
});
