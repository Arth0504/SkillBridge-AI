import {
  suggestResumeContentWithAI,
  checkResumeGrammarWithAI,
} from '../services/ai.service.js';
import { sendResponse } from '../utils/sendResponse.js';
import { logger } from '../utils/logger.js';

/**
 * Handle AI resume section content suggestion
 * @route POST /api/v1/ai/suggest-content
 */
export const suggestResumeContent = async (req, res) => {
  try {
    const { section, context } = req.body;

    if (!section || !context) {
      return sendResponse(res, 400, false, 'Section and context details are required.');
    }

    const suggestions = await suggestResumeContentWithAI(section, context);
    return sendResponse(res, 200, true, 'AI Resume suggestions generated successfully', suggestions);
  } catch (err) {
    logger.error(`Error generating resume suggestions: ${err.message}`);
    return sendResponse(res, 500, false, `Failed to generate suggestions: ${err.message}`);
  }
};

/**
 * Handle AI grammar checks
 * @route POST /api/v1/ai/check-grammar
 */
export const checkResumeGrammar = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return sendResponse(res, 400, false, 'Text is required for grammar check.');
    }

    const corrections = await checkResumeGrammarWithAI(text);
    return sendResponse(res, 200, true, 'Grammar check completed successfully', corrections);
  } catch (err) {
    logger.error(`Error checking resume grammar: ${err.message}`);
    return sendResponse(res, 500, false, `Failed to review grammar: ${err.message}`);
  }
};
