import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { Document } from '../models/document.model.js';

/**
 * Upload New Document
 * POST /api/v1/documents
 */
export const uploadDocumentHandler = asyncHandler(async (req, res, next) => {
  const { title, category } = req.body;
  const file = req.file;

  if (!file) {
    return next(new AppError('Please attach a document file to upload.', 400));
  }

  const ownerId = req.user._id;
  const ownerType = req.user.role === 'company' ? 'Company' : req.user.role === 'admin' ? 'Admin' : 'Candidate';

  const fileUrl = `/uploads/documents/${Date.now()}_${file.originalname}`;

  const doc = await Document.create({
    ownerId,
    ownerType,
    category: category || 'Company Document',
    title: title || file.originalname,
    fileUrl,
    fileSize: file.size,
    mimeType: file.mimetype,
    version: 1,
    versionHistory: [{ version: 1, fileUrl, uploadedAt: new Date() }],
  });

  return sendResponse(res, 201, true, 'Document uploaded successfully', { document: doc });
});

/**
 * Get Documents List for User/Company
 * GET /api/v1/documents
 */
export const getDocumentsHandler = asyncHandler(async (req, res, _next) => {
  const ownerId = req.user._id;
  const documents = await Document.find({ ownerId, isDeleted: false }).sort({ createdAt: -1 }).lean();

  return sendResponse(res, 200, true, 'Documents retrieved successfully', { documents });
});

/**
 * Delete Document (Soft Delete)
 * DELETE /api/v1/documents/:id
 */
export const deleteDocumentHandler = asyncHandler(async (req, res, next) => {
  const doc = await Document.findOne({ _id: req.params.id, ownerId: req.user._id });
  if (!doc) {
    return next(new AppError('Document not found.', 404));
  }

  doc.isDeleted = true;
  await doc.save();

  return sendResponse(res, 200, true, 'Document deleted successfully', { id: doc._id });
});
