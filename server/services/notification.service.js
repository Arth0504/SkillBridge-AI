import mongoose from 'mongoose';
import { Notification } from '../models/notification.model.js';
import { emitNotificationToUser } from '../sockets/notification.socket.js';
import { AppError } from '../utils/AppError.js';

/**
 * Get Unread Notification Count for User
 */
export const getUnreadCount = async (receiverId, receiverRole) => {
  return await Notification.countDocuments({
    receiverId: new mongoose.Types.ObjectId(receiverId),
    receiverRole,
    isRead: false,
    isDeleted: { $ne: true },
  });
};

/**
 * Create and persist a new notification & emit real-time Socket.IO event
 */
export const createNotificationService = async ({
  receiverId,
  receiverRole,
  senderId = null,
  senderRole = 'system',
  title,
  message,
  type,
  priority = 'medium',
  metadata = {},
}) => {
  const notification = await Notification.create({
    receiverId,
    receiverRole,
    senderId,
    senderRole,
    title,
    message,
    type,
    priority,
    metadata,
  });

  const unreadCount = await getUnreadCount(receiverId, receiverRole);

  // Emit real-time Socket.IO notification to receiver
  emitNotificationToUser(receiverId, receiverRole, 'notification:new', {
    notification,
    unreadCount,
  });

  return { notification, unreadCount };
};

/**
 * Get Paginated Notifications for Receiver with Filters
 */
export const getNotificationsService = async (receiverIdStr, receiverRole, query = {}) => {
  const receiverId = new mongoose.Types.ObjectId(receiverIdStr);
  const { isRead, priority, type, startDate, endDate } = query;
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {
    receiverId,
    receiverRole,
    isDeleted: { $ne: true },
  };

  if (isRead !== undefined) {
    filter.isRead = isRead === 'true' || isRead === true;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (type) {
    filter.type = type;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const [notifications, totalItems, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    getUnreadCount(receiverIdStr, receiverRole),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    notifications,
    unreadCount,
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
 * Mark a single notification as read
 */
export const markNotificationAsReadService = async (notificationId, receiverIdStr, receiverRole) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    receiverId: new mongoose.Types.ObjectId(receiverIdStr),
    receiverRole,
    isDeleted: { $ne: true },
  });

  if (!notification) {
    throw new AppError('Notification not found or access denied', 404);
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  const unreadCount = await getUnreadCount(receiverIdStr, receiverRole);

  // Emit real-time Socket event
  emitNotificationToUser(receiverIdStr, receiverRole, 'notification:read', {
    notificationId: notification._id,
    unreadCount,
  });

  return { notification, unreadCount };
};

/**
 * Mark all unread notifications as read for receiver
 */
export const markAllNotificationsAsReadService = async (receiverIdStr, receiverRole) => {
  const result = await Notification.updateMany(
    {
      receiverId: new mongoose.Types.ObjectId(receiverIdStr),
      receiverRole,
      isRead: false,
      isDeleted: { $ne: true },
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  // Emit real-time Socket event
  emitNotificationToUser(receiverIdStr, receiverRole, 'notification:all-read', {
    unreadCount: 0,
    modifiedCount: result.modifiedCount,
  });

  return {
    modifiedCount: result.modifiedCount,
    unreadCount: 0,
  };
};

/**
 * Delete a notification (Soft Delete)
 */
export const deleteNotificationService = async (notificationId, receiverIdStr, receiverRole) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    receiverId: new mongoose.Types.ObjectId(receiverIdStr),
    receiverRole,
    isDeleted: { $ne: true },
  });

  if (!notification) {
    throw new AppError('Notification not found or access denied', 404);
  }

  notification.isDeleted = true;
  notification.deletedAt = new Date();
  await notification.save();

  const unreadCount = await getUnreadCount(receiverIdStr, receiverRole);

  // Emit real-time Socket event
  emitNotificationToUser(receiverIdStr, receiverRole, 'notification:delete', {
    notificationId: notification._id,
    unreadCount,
  });

  return { notificationId: notification._id, unreadCount };
};
