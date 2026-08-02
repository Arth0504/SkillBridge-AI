import express from 'express';
import { getCompanyCalendarHandler } from '../controllers/companyCalendar.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo(ROLES.COMPANY));

/**
 * @route GET /api/v1/company/calendar
 * @desc Retrieve company hiring calendar events
 */
router.get('/', getCompanyCalendarHandler);

export default router;
