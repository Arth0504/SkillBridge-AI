import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ROLES } from '../config/constants.js';
import { Candidate } from '../models/candidate.model.js';
import { Company } from '../models/company.model.js';
import { logger } from '../utils/logger.js';

let io = null;

/**
 * Helper to construct private room name
 */
export const getUserRoomName = (receiverId, receiverRole) => {
  return `user:${receiverRole}:${receiverId.toString()}`;
};

/**
 * Initialize Socket.IO Server Gateway
 * @param {import('http').Server} httpServer Node.js HTTP Server instance
 */
export const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket.IO Authentication Middleware
  io.use(async (socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

      if (!token) {
        return next(new Error('Authentication Error: Missing access token'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      let user = null;

      if (decoded.role === ROLES.CANDIDATE) {
        user = await Candidate.findById(decoded.id).select('_id email fullName role');
      } else if (decoded.role === ROLES.COMPANY) {
        user = await Company.findById(decoded.id).select('_id email companyName role');
      }

      if (!user) {
        return next(new Error('Authentication Error: User no longer exists'));
      }

      socket.user = {
        id: user._id.toString(),
        role: decoded.role,
        email: user.email,
      };

      next();
    } catch (err) {
      logger.error(`Socket auth failed: ${err.message}`);
      return next(new Error('Authentication Error: Invalid or expired token'));
    }
  });

  // Socket Connection Handling
  io.on('connection', (socket) => {
    const userRoom = getUserRoomName(socket.user.id, socket.user.role);
    socket.join(userRoom);
    logger.info(`🔌 Socket connected: ${socket.id} | User: ${socket.user.id} (${socket.user.role}) | Joined Room: ${userRoom}`);

    // Client event: Mark notification as read
    socket.on('notification:read', async (data) => {
      logger.info(`Socket event [notification:read] received from user ${socket.user.id}`, data);
      socket.emit('notification:read_ack', { success: true, notificationId: data?.notificationId });
    });

    // Client event: Mark all as read
    socket.on('notification:all-read', async () => {
      logger.info(`Socket event [notification:all-read] received from user ${socket.user.id}`);
      socket.emit('notification:all-read_ack', { success: true });
    });

    // Client event: Delete notification
    socket.on('notification:delete', async (data) => {
      logger.info(`Socket event [notification:delete] received from user ${socket.user.id}`, data);
      socket.emit('notification:delete_ack', { success: true, notificationId: data?.notificationId });
    });

    // Disconnect Handling
    socket.on('disconnect', (reason) => {
      logger.info(`🔌 Socket disconnected: ${socket.id} | User: ${socket.user.id} | Reason: ${reason}`);
    });
  });

  return io;
};

/**
 * Get active Socket.IO instance
 */
export const getIO = () => {
  return io;
};

/**
 * Emit real-time notification to user's private room
 * @param {string|mongoose.Types.ObjectId} receiverId Target User ID
 * @param {string} receiverRole Target User Role ('candidate'|'company')
 * @param {string} event Socket Event Name
 * @param {Object} payload Payload data
 */
export const emitNotificationToUser = (receiverId, receiverRole, event, payload) => {
  if (!io) return false;
  const roomName = getUserRoomName(receiverId, receiverRole);
  io.to(roomName).emit(event, payload);
  logger.info(`📢 Socket event [${event}] emitted to room [${roomName}]`);
  return true;
};
