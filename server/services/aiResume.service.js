import mongoose from 'mongoose';
import { ResumeAnalysis } from '../models/resumeAnalysis.model.js';
import { Job } from '../models/job.model.js';
import { AppError } from '../utils/AppError.js';
import {
  extractTextFromBuffer,
  analyzeATSWithAI,
  matchJobWithAI,
} from './ai.service.js';

/**
 * Perform AI Resume Analysis & Job Match
 */
export const analyzeResumeService = async ({
  candidateIdStr,
  jobIdStr = null,
  fileBuffer = null,
  fileName = 'Resume.pdf',
  fileMimeType = '',
  rawText = '',
}) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);
  let jobId = null;
  let jobDescription = '';

  if (jobIdStr && mongoose.Types.ObjectId.isValid(jobIdStr)) {
    jobId = new mongoose.Types.ObjectId(jobIdStr);
    const job = await Job.findById(jobId).select('title description requiredSkills').lean();
    if (job) {
      jobDescription = `${job.title} - ${job.description} Skills: ${job.requiredSkills.join(', ')}`;
    }
  }

  let extractedText = rawText ? rawText.trim() : '';

  // Parse text if fileBuffer provided
  if (fileBuffer) {
    const extractionResult = await extractTextFromBuffer(fileBuffer, fileName);
    if (extractionResult && extractionResult.text) {
      extractedText = extractionResult.text;
    }
  }

  if (!extractedText) {
    throw new AppError('Could not extract readable text from the provided resume file or input.', 400);
  }

  // 1. Run ATS Analysis
  const atsAnalysis = await analyzeATSWithAI(extractedText, jobDescription);

  // 2. Run Job Match if Job Description present
  let matchAnalysis = null;
  if (jobDescription) {
    matchAnalysis = await matchJobWithAI(extractedText, jobDescription);
  }

  const atsScore = atsAnalysis.overallAtsScore || 75;
  const matchScore = matchAnalysis ? matchAnalysis.matchScore : 0;
  const suggestions = atsAnalysis.top5Improvements || atsAnalysis.improvementSuggestions || [];

  const combinedAiResponse = {
    atsAnalysis,
    jobMatch: matchAnalysis,
  };

  // 3. Persist Analysis in MongoDB Database
  const analysisRecord = await ResumeAnalysis.create({
    candidateId,
    jobId,
    resumeName: fileName,
    atsScore,
    matchScore,
    extractedText: extractedText.substring(0, 2000), // store preview
    aiResponse: combinedAiResponse,
    suggestions,
  });

  return analysisRecord;
};

/**
 * Get Candidate's Analysis History List
 */
export const getResumeHistoryService = async (candidateIdStr, query = {}) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { candidateId, isDeleted: { $ne: true } };

  const [history, totalItems] = await Promise.all([
    ResumeAnalysis.find(filter)
      .populate('jobId', 'title company department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ResumeAnalysis.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    history,
    pagination: {
      totalItems,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Get Single Analysis History Record by ID
 */
export const getResumeHistoryByIdService = async (analysisId, candidateIdStr) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);

  const record = await ResumeAnalysis.findOne({
    _id: analysisId,
    candidateId,
    isDeleted: { $ne: true },
  })
    .populate('jobId', 'title company department workMode employmentType')
    .lean();

  if (!record) {
    throw new AppError('Resume analysis record not found or access denied.', 404);
  }

  return record;
};

/**
 * Delete Single Analysis History Record (Soft Delete)
 */
export const deleteResumeHistoryService = async (analysisId, candidateIdStr) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);

  const record = await ResumeAnalysis.findOne({
    _id: analysisId,
    candidateId,
    isDeleted: { $ne: true },
  });

  if (!record) {
    throw new AppError('Resume analysis record not found or access denied.', 404);
  }

  record.isDeleted = true;
  record.deletedAt = new Date();
  await record.save();

  return { id: record._id };
};
