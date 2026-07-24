import { Company } from '../models/company.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/upload.service.js';

/**
 * Get Company Profile
 * @route GET /api/v1/company/profile
 */
export const getCompanyProfile = asyncHandler(async (req, res, _next) => {
  const company = await Company.findById(req.user._id);
  return sendResponse(res, 200, true, 'Company profile retrieved', { profile: company });
});

/**
 * Update Company Profile
 * @route PUT /api/v1/company/profile
 */
export const updateCompanyProfile = asyncHandler(async (req, res, _next) => {
  const allowedFields = [
    'companyName',
    'website',
    'industry',
    'description',
    'location',
    'companySize',
    'socialLinks',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const company = await Company.findById(req.user._id);

  Object.assign(company, updates);

  // Check profile completion criteria (companyName, website, industry, description, location, companySize)
  if (
    company.companyName &&
    company.website &&
    company.industry &&
    company.description &&
    company.location &&
    company.companySize
  ) {
    company.profileCompleted = true;
  }

  await company.save();

  return sendResponse(res, 200, true, 'Company profile updated successfully', { profile: company });
});

/**
 * Upload Company Logo Image
 * @route POST /api/v1/company/profile/logo
 */
export const uploadLogo = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please select a logo image file to upload.', 400));
  }

  if (!req.file.mimetype.startsWith('image/')) {
    return next(new AppError('Only image files are accepted for logo uploads.', 400));
  }

  const company = await Company.findById(req.user._id);

  // Delete previous logo from Cloudinary if exists
  if (company.logoPublicId) {
    await deleteFromCloudinary(company.logoPublicId);
  }

  // Upload to Cloudinary under folder 'skillbridge/logos'
  const uploadResult = await uploadToCloudinary(req.file.buffer, 'skillbridge/logos', 'image');

  company.logoUrl = uploadResult.url;
  company.logoPublicId = uploadResult.publicId;
  await company.save();

  return sendResponse(res, 200, true, 'Logo uploaded successfully', {
    logoUrl: company.logoUrl,
    logoPublicId: company.logoPublicId,
  });
});
