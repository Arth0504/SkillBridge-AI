import express from 'express';
import {
  getNotificationsHandler,
  markNotificationAsReadHandler,
  markAllNotificationsAsReadHandler,
  deleteNotificationHandler,
} from '../controllers/notification.controller.js';
import {
  validateNotificationId,
  validateNotificationQuery,
} from '../validations/notification.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Guard company notification routes
router.use(protect);
router.use(restrictTo(ROLES.COMPANY));

/**
 * @route GET /api/v1/company/notifications
 * @desc Get company notifications list with filters & pagination
 */
router.get('/', validateNotificationQuery, getNotificationsHandler);

/**
 * @route PATCH /api/v1/company/notifications/read-all
 * @desc Mark all company notifications as read
 */
router.patch('/read-all', markAllNotificationsAsReadHandler);

/**
 * @route PATCH /api/v1/company/notifications/:id/read
 * @desc Mark single notification as read
 */
router.patch('/:id/read', validateNotificationId, markNotificationAsReadHandler);

/**
 * @route DELETE /api/v1/company/notifications/:id
 * @desc Delete single notification
 */
router.delete('/:id', validateNotificationId, deleteNotificationHandler);

export default router;
