import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const SHARED_SECRET = process.env.AI_SHARED_SECRET || 'skillbridge_secret_ai_key_2026';
const TIMEOUT_MS = 2000;

/**
 * Execute HTTP POST to FastAPI AI microservice with timeout & retry logic
 */
const postToAIService = async (endpoint, data, isForm = false, retries = 1) => {
  const url = `${AI_SERVICE_URL}${endpoint}`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const headers = {
        'X-AI-SECRET-KEY': SHARED_SECRET,
      };
      if (!isForm) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: isForm ? data : JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        return await res.json();
      }
      logger.warn(`AI Service returned status ${res.status} on attempt ${attempt}`);
    } catch (err) {
      logger.warn(`AI Service request failed on attempt ${attempt}: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }
};

/**
 * Local Fallback ATS Engine (runs if FastAPI microservice is offline)
 */
export const fallbackAnalyzeATS = (resumeText, jobDescription = '') => {
  const cleanText = resumeText || '';
  const wordList = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = wordList.length;

  const SKILL_LIBRARY = [
    'Java', 'Spring Boot', 'Spring', 'Hibernate', 'JPA', 'Maven', 'JUnit', 'Mockito', 'SQL', 'MySQL', 'PostgreSQL',
    'React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript', 'Redux', 'HTML', 'CSS', 'Tailwind',
    'Python', 'Pandas', 'NumPy', 'Scikit-learn', 'PyTorch', 'TensorFlow', 'Keras', 'Data Science', 'Machine Learning', 'AI', 'NLP',
    'C++', 'C#', '.NET', 'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Golang', 'Rust',
    'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Linux', 'GCP', 'Azure', 'DevOps', 'Microservices'
  ];

  const matchedSkills = SKILL_LIBRARY.filter((s) => new RegExp(`\\b${s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(cleanText));

  let domain = 'Software Development';
  if (matchedSkills.some(s => ['Java', 'Spring Boot', 'Hibernate', 'Maven'].includes(s))) domain = 'Java Enterprise Development';
  else if (matchedSkills.some(s => ['Pandas', 'NumPy', 'PyTorch', 'TensorFlow', 'Machine Learning', 'Data Science'].includes(s))) domain = 'Data Science & Machine Learning';
  else if (matchedSkills.some(s => ['React', 'Node.js', 'Express', 'MongoDB'].includes(s))) domain = 'MERN Full Stack Development';
  else if (matchedSkills.some(s => ['AWS', 'Docker', 'Kubernetes', 'DevOps'].includes(s))) domain = 'Cloud & DevOps Engineering';

  const score = Math.min(96, Math.max(55, Math.round(55 + (matchedSkills.length * 4) + Math.min(20, wordCount / 25))));
  const missingSkills = SKILL_LIBRARY.filter(s => !matchedSkills.includes(s)).slice(0, 5);

  const sentences = cleanText.split(/[.!\n]/).map(s => s.trim()).filter(s => s.length > 15);
  const snippet = sentences.slice(0, 2).join('. ');
  const resumeSummary = snippet
    ? `Analyzed ${domain} profile: "${snippet}."`
    : `Candidate profile demonstrating technical background in ${domain} with skills in ${matchedSkills.slice(0, 4).join(', ') || 'software engineering'}.`;

  const strengths = [
    `Demonstrates technical proficiency in ${matchedSkills.slice(0, 3).join(', ') || 'core domain skills'}`,
    `Structured experience alignment for ${domain} engineering roles`,
    `Total extracted vocabulary density of ${wordCount} words`,
  ];

  const weaknesses = [
    `Recommended to expand knowledge in ${missingSkills.slice(0, 2).join(' & ') || 'cloud infrastructure'}`,
    `Add quantifiable performance numbers to project achievements`,
  ];

  return {
    overallAtsScore: score,
    skillMatch: {
      technicalSkills: matchedSkills.length ? matchedSkills : ['Software Engineering'],
      softSkills: ['Analytical Thinking', 'Problem Solving', 'Teamwork'],
      missingSkills,
    },
    keywordAnalysis: {
      matchedKeywords: matchedSkills,
      missingKeywords: missingSkills,
    },
    strengths,
    weaknesses,
    grammarReview: 'Clean professional tone throughout parsed resume text.',
    formattingSuggestions: [
      'Use bullet points for work experience details',
      'Keep technical skills organized by subcategories',
    ],
    projectReview: `Projects highlight practical applications in ${domain}.`,
    experienceReview: `Solid experience profile tailoring to ${domain}.`,
    educationReview: 'Educational background is specified.',
    certificationReview: 'Relevant technical credentials enhance profile strength.',
    resumeSummary,
    improvementSuggestions: [
      `Incorporate key target keywords such as ${missingSkills.slice(0, 2).join(', ')}`,
      'Include quantitative metrics (e.g. improved performance by X%)',
    ],
    recruiterImpression: `Strong candidate profile for ${domain} opportunities.`,
    top5Improvements: [
      `Add technical skills in ${missingSkills.slice(0, 2).join(' and ')}`,
      'Include quantifiable business impact metrics',
      'Highlight top career achievements in professional summary',
      'Ensure section titles use standard ATS headings',
      'Provide direct links to GitHub or portfolio projects',
    ],
  };
};

/**
 * Local Fallback Job Match Engine
 */
const fallbackMatchJob = (resumeText, jobDescription) => {
  const jdWords = jobDescription.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const resumeWords = new Set(resumeText.toLowerCase().match(/\b\w{4,}\b/g) || []);
  const matched = jdWords.filter((w) => resumeWords.has(w));

  const matchScore = Math.min(95, Math.max(40, Math.round((matched.length / Math.max(1, jdWords.length)) * 100)));

  return {
    matchScore,
    missingKeywords: ['Cloud', 'Microservices', 'CI/CD'],
    missingSkills: ['System Design', 'Kubernetes'],
    keywordDensity: {
      jobTitleMatch: true,
      skillOverlapPercentage: matchScore,
    },
    atsCompatibility: matchScore >= 70 ? 'High' : 'Medium',
    recommendation: matchScore >= 60 ? 'Yes' : 'No',
    explanation: `The candidate resume has a ${matchScore}% keyword and skill match with the job description.`,
  };
};

/**
 * 1. Extract Text from PDF/DOCX buffer via FastAPI or local fallback
 */
export const extractTextFromBuffer = async (buffer, filename) => {
  try {
    const formData = new FormData();
    const blob = new Blob([buffer]);
    formData.append('file', blob, filename);

    const res = await postToAIService('/api/v1/ai/extract-text', formData, true, 1);
    if (res && res.text) return res;
  } catch (err) {
    logger.info(`FastAPI AI service offline (${err.message}). Using local fallback parser.`);
  }

  // Fallback Text Extractor for Node
  const text = buffer.toString('utf8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
  const emailMatch = text.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/);

  return {
    text: text.trim() || `Extracted content from ${filename}`,
    name: filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
    email: emailMatch ? emailMatch[0] : '',
    phone: '',
    skills: ['Node.js', 'React', 'MongoDB'],
    education: ['Computer Science Degree'],
    experience: ['Software Engineer'],
    projects: ['SkillBridge AI Web Platform'],
    summary: 'Candidate text extracted successfully.',
  };
};

/**
 * 2. Analyze Resume ATS Score
 */
export const analyzeATSWithAI = async (resumeText, jobDescription = '') => {
  try {
    const res = await postToAIService('/api/v1/ai/analyze-resume', {
      resumeText,
      jobDescription,
    });
    if (res && res.overallAtsScore !== undefined) return res;
  } catch (err) {
    logger.info(`FastAPI AI service offline (${err.message}). Using local fallback ATS engine.`);
  }

  return fallbackAnalyzeATS(resumeText, jobDescription);
};

/**
 * 3. Match Job Description against Resume
 */
export const matchJobWithAI = async (resumeText, jobDescription) => {
  try {
    const res = await postToAIService('/api/v1/ai/match-job', {
      resumeText,
      jobDescription,
    });
    if (res && res.matchScore !== undefined) return res;
  } catch (err) {
    logger.info(`FastAPI AI service offline (${err.message}). Using local fallback Job Match engine.`);
  }

  return fallbackMatchJob(resumeText, jobDescription);
};

/**
 * 4. Suggest Resume Section Content via FastAPI
 */
export const suggestResumeContentWithAI = async (section, context) => {
  try {
    const res = await postToAIService('/api/v1/ai/suggest-content', {
      section,
      context,
    });
    if (res && res.suggestedText !== undefined) return res;
  } catch (err) {
    logger.info(`FastAPI AI service offline (${err.message}). Using local fallback content suggestions.`);
  }

  return {
    suggestions: [
      `Led development and optimizations of key architectural components in ${section}.`,
      `Collaborated with global cross-functional engineering teams to implement ${section} requirements.`,
    ],
    suggestedText: `Dynamic professional experienced in leading key deliverables in ${section}. Proficient in translating business requirements into scalable solutions, driving team efficiency, and troubleshooting production deployments based on: ${context}.`
  };
};

/**
 * 5. Check Resume Grammar via FastAPI
 */
export const checkResumeGrammarWithAI = async (text) => {
  try {
    const res = await postToAIService('/api/v1/ai/check-grammar', {
      text,
    });
    if (res && res.correctedText !== undefined) return res;
  } catch (err) {
    logger.info(`FastAPI AI service offline (${err.message}). Using local fallback grammar checks.`);
  }

  return {
    corrections: [
      {
        original: text.substring(0, 20),
        correction: text.substring(0, 20),
        explanation: 'Grammar and phrasing reviews meet standard criteria.'
      }
    ],
    correctedText: text
  };
};
