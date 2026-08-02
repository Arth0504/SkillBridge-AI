import { Application } from '../models/application.model.js';
import { Candidate } from '../models/candidate.model.js';
import { Job } from '../models/job.model.js';

/**
 * Unified AI Match Engine
 * Synthesizes Candidate Resume, AI Interview Performance, AI Coding Assessment, and Job Spec
 */
export const calculateFinalAIMatchScore = async (applicationId) => {
  const application = await Application.findById(applicationId)
    .populate('candidateId')
    .populate('jobId');

  if (!application) return null;

  const candidate = application.candidateId || {};
  const job = application.jobId || {};

  // 1. Skill Overlap Calculation
  const reqSkills = (job.requiredSkills || []).map((s) => s.toLowerCase());
  const candSkills = (candidate.skills || []).map((s) => s.toLowerCase());
  const matchedSkills = reqSkills.filter((s) => candSkills.includes(s));
  const skillMatchPercent = reqSkills.length > 0 ? (matchedSkills.length / reqSkills.length) * 100 : 80;

  // 2. Component Scores (Defaults / Actuals)
  const resumeScore = application.resumeScore !== null && application.resumeScore !== undefined ? application.resumeScore : Math.round(Math.min(95, Math.max(50, skillMatchPercent)));
  const interviewScore = application.interviewScore !== null && application.interviewScore !== undefined ? application.interviewScore : null;
  const codingScore = application.codingScore !== null && application.codingScore !== undefined ? application.codingScore : null;
  const commScore = application.communicationScore !== null && application.communicationScore !== undefined ? application.communicationScore : (interviewScore ? Math.round(interviewScore * 0.95) : null);

  // 3. Weighted Final Match Percentage Calculation
  let totalWeight = 0.4;
  let weightedSum = resumeScore * 0.4;

  if (interviewScore !== null) {
    totalWeight += 0.35;
    weightedSum += interviewScore * 0.35;
  }

  if (codingScore !== null) {
    totalWeight += 0.25;
    weightedSum += codingScore * 0.25;
  }

  const finalMatchScore = Math.round(weightedSum / totalWeight);

  // 4. Hiring Recommendation Matrix
  let recommendation = 'Needs Improvement';
  if (finalMatchScore >= 85) {
    recommendation = 'Highly Recommended';
  } else if (finalMatchScore >= 70) {
    recommendation = 'Recommended';
  } else if (finalMatchScore >= 50) {
    recommendation = 'Needs Improvement';
  } else {
    recommendation = 'Not Recommended';
  }

  // 5. Dynamic Strengths & Weaknesses
  const strengths = [];
  const weaknesses = [];

  if (matchedSkills.length > 0) {
    strengths.push(`Matches core technical requirements: ${matchedSkills.slice(0, 3).join(', ')}`);
  }
  if (resumeScore >= 75) {
    strengths.push(`Strong ATS resume compatibility rating (${resumeScore}/100)`);
  }
  if (interviewScore && interviewScore >= 80) {
    strengths.push(`Exceptional technical interview demonstration (${interviewScore}/100)`);
  }
  if (codingScore && codingScore >= 80) {
    strengths.push(`High algorithmic correctness and code efficiency (${codingScore}/100)`);
  }

  const missingSkills = reqSkills.filter((s) => !candSkills.includes(s));
  if (missingSkills.length > 0) {
    weaknesses.push(`Missing keyword match for: ${missingSkills.slice(0, 3).join(', ')}`);
  }
  if (interviewScore && interviewScore < 60) {
    weaknesses.push(`Requires improvement in technical interview depth (${interviewScore}/100)`);
  }
  if (codingScore && codingScore < 60) {
    weaknesses.push(`Coding test highlighted edge case or space complexity limitations (${codingScore}/100)`);
  }

  if (strengths.length === 0) strengths.push('Demonstrates relevant foundational background');
  if (weaknesses.length === 0) weaknesses.push('No critical technical bottlenecks identified');

  // Persist updated scores on Application document
  application.resumeScore = resumeScore;
  application.interviewScore = interviewScore;
  application.codingScore = codingScore;
  application.communicationScore = commScore;
  application.matchScore = finalMatchScore;
  application.hiringRecommendation = recommendation;
  application.strengths = strengths;
  application.weaknesses = weaknesses;

  await application.save();

  return {
    applicationId: application._id,
    matchScore: finalMatchScore,
    resumeScore,
    interviewScore,
    codingScore,
    communicationScore: commScore,
    hiringRecommendation: recommendation,
    strengths,
    weaknesses,
  };
};
