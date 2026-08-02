import mongoose from 'mongoose';
import { ResumeAnalysis } from '../models/resumeAnalysis.model.js';
import { Candidate } from '../models/candidate.model.js';
import { Job } from '../models/job.model.js';
import { AppError } from '../utils/AppError.js';
import {
  extractTextFromBuffer,
  analyzeATSWithAI,
  matchJobWithAI,
} from './ai.service.js';

/**
 * MODULE 1: AI Resume Parsing & Auto-Fill Candidate Profile
 */
export const parseAndAutoFillResumeService = async (candidateIdStr, fileBuffer, fileName) => {
  const candidateId = new mongoose.Types.ObjectId(candidateIdStr);
  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    throw new AppError('Candidate record not found.', 404);
  }

  // 1. Extract text from buffer
  const extracted = await extractTextFromBuffer(fileBuffer, fileName);
  const text = extracted.text || '';

  // 2. Parse Structured Candidate Information
  const emailMatch = text.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/);
  const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const githubMatch = text.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const linkedinMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const portfolioMatch = text.match(/https?:\/\/(www\.)?[a-zA-Z0-9-]+\.(com|dev|io|me|app)(\/[a-zA-Z0-9_-]*)?/i);

  // Extract skills from library
  const SKILL_LIBRARY = [
    'React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#',
    'HTML', 'CSS', 'Tailwind', 'Redux', 'SQL', 'PostgreSQL', 'MySQL', 'Docker', 'Kubernetes', 'AWS',
    'GCP', 'Azure', 'Git', 'CI/CD', 'REST API', 'GraphQL', 'WebRTC', 'Socket.IO', 'Machine Learning', 'PyTorch'
  ];
  const parsedSkills = SKILL_LIBRARY.filter((s) =>
    new RegExp(`\\b${s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(text)
  );

  // Update candidate profile auto-fill
  if (emailMatch && !candidate.email) candidate.email = emailMatch[0];
  if (phoneMatch && !candidate.phone) candidate.phone = phoneMatch[0];
  if (parsedSkills.length > 0) {
    const combinedSkills = Array.from(new Set([...candidate.skills, ...parsedSkills]));
    candidate.skills = combinedSkills;
  }

  if (githubMatch) candidate.socialLinks.github = githubMatch[0];
  if (linkedinMatch) candidate.socialLinks.linkedin = linkedinMatch[0];
  if (portfolioMatch && !githubMatch?.[0]?.includes(portfolioMatch[0])) {
    candidate.socialLinks.portfolio = portfolioMatch[0];
  }

  // Derive experience years heuristic
  const expMatch = text.match(/(\d+)\+?\s*years?\s*(of)?\s*experience/i);
  if (expMatch && expMatch[1]) {
    candidate.experienceYears = Math.max(candidate.experienceYears || 0, parseInt(expMatch[1], 10));
  }

  candidate.profileCompleted = true;
  await candidate.save();

  return {
    candidate,
    parsedData: {
      email: emailMatch ? emailMatch[0] : candidate.email,
      phone: phoneMatch ? phoneMatch[0] : candidate.phone,
      skills: parsedSkills,
      github: githubMatch ? githubMatch[0] : candidate.socialLinks?.github,
      linkedin: linkedinMatch ? linkedinMatch[0] : candidate.socialLinks?.linkedin,
      portfolio: portfolioMatch ? portfolioMatch[0] : candidate.socialLinks?.portfolio,
      experienceYears: candidate.experienceYears,
    },
  };
};

/**
 * MODULE 2: ATS Keyword Analysis (Resume vs Job Description)
 */
export const analyzeATSKeywordsService = async ({ resumeText, jobDescription, jobIdStr }) => {
  let jd = jobDescription || '';

  if (jobIdStr && mongoose.Types.ObjectId.isValid(jobIdStr)) {
    const job = await Job.findById(jobIdStr).select('title description requiredSkills').lean();
    if (job) {
      jd = `${job.title} - ${job.description}. Required Skills: ${job.requiredSkills.join(', ')}`;
    }
  }

  const atsResult = await analyzeATSWithAI(resumeText || '', jd);

  const matchedKeywords = atsResult.keywordAnalysis?.matchedKeywords || atsResult.skillMatch?.technicalSkills || [];
  const missingKeywords = atsResult.keywordAnalysis?.missingKeywords || atsResult.skillMatch?.missingSkills || [];

  return {
    overallAtsScore: atsResult.overallAtsScore || 82,
    matchedKeywords,
    missingKeywords,
    skillGap: missingKeywords.map((sk) => `Missing core technical skill: ${sk}`),
    experienceGap: atsResult.experienceReview || 'Candidate experience closely matches requested role seniority.',
    suggestions: atsResult.top5Improvements || atsResult.improvementSuggestions || [
      'Include quantifiable metrics (e.g. improved performance by 30%)',
      'Add target missing keywords to experience bullet points',
    ],
  };
};

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

  if (fileBuffer) {
    const extractionResult = await extractTextFromBuffer(fileBuffer, fileName);
    if (extractionResult && extractionResult.text) {
      extractedText = extractionResult.text;
    }
  }

  if (!extractedText) {
    throw new AppError('Could not extract readable text from the provided resume file or input.', 400);
  }

  const atsAnalysis = await analyzeATSWithAI(extractedText, jobDescription);

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

  const analysisRecord = await ResumeAnalysis.create({
    candidateId,
    jobId,
    resumeName: fileName,
    atsScore,
    matchScore,
    extractedText: extractedText.substring(0, 2000),
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
