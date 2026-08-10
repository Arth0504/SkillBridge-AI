import express from 'express';
import {
  getAdminControlDashboardHandler,
  updateUserAccountStatusHandler,
  updateCompanyVerificationHandler,
  moderateJobHandler,
  exportCollectionCsvHandler,
  sendBroadcastNotificationHandler,
} from '../controllers/adminControl.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/dashboard', getAdminControlDashboardHandler);
router.patch('/users/:id/status', updateUserAccountStatusHandler);
router.patch('/companies/:id/verification', updateCompanyVerificationHandler);
router.patch('/jobs/:id/moderation', moderateJobHandler);
router.get('/export/:collection', exportCollectionCsvHandler);
router.post('/broadcast', sendBroadcastNotificationHandler);

export default router;
