import express from 'express';
import {
  suggestResumeContent,
  checkResumeGrammar,
} from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkDbConnection } from '../middleware/db.middleware.js';

const router = express.Router();

router.post('/suggest-content', checkDbConnection, protect, suggestResumeContent);
router.post('/check-grammar', checkDbConnection, protect, checkResumeGrammar);

export default router;
