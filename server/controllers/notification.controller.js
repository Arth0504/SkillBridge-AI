import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/sendResponse.js';
import {
  getNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  deleteNotificationService,
} from '../services/notification.service.js';

/**
 * Get User Notifications (Candidate / Company)
 */
export const getNotificationsHandler = asyncHandler(async (req, res, _next) => {
  const result = await getNotificationsService(req.user._id, req.role, req.query);

  return sendResponse(res, 200, true, 'Notifications retrieved successfully', result);
});

/**
 * Mark Single Notification as Read
 */
export const markNotificationAsReadHandler = asyncHandler(async (req, res, _next) => {
  const result = await markNotificationAsReadService(req.params.id, req.user._id, req.role);

  return sendResponse(res, 200, true, 'Notification marked as read successfully', result);
});

/**
 * Mark All Notifications as Read
 */
export const markAllNotificationsAsReadHandler = asyncHandler(async (req, res, _next) => {
  const result = await markAllNotificationsAsReadService(req.user._id, req.role);

  return sendResponse(res, 200, true, 'All notifications marked as read successfully', result);
});

/**
 * Delete Single Notification (Soft Delete)
 */
export const deleteNotificationHandler = asyncHandler(async (req, res, _next) => {
  const result = await deleteNotificationService(req.params.id, req.user._id, req.role);

  return sendResponse(res, 200, true, 'Notification deleted successfully', result);
});
