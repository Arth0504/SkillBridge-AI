import express from 'express';
import {
  createOfferLetterHandler,
  getCompanyOfferLettersHandler,
  getOfferLetterByIdHandler,
} from '../controllers/offerLetter.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.post('/', restrictTo(ROLES.COMPANY), createOfferLetterHandler);
router.get('/', restrictTo(ROLES.COMPANY), getCompanyOfferLettersHandler);
router.get('/:id', getOfferLetterByIdHandler);

export default router;
