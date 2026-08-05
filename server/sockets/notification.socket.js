import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ROLES } from '../config/constants.js';
import { Candidate } from '../models/candidate.model.js';
import { Company } from '../models/company.model.js';
import { InterviewRoom } from '../models/interviewRoom.model.js';
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

      // Handle hardcoded Admin Session Token
      if (typeof token === 'string' && token.startsWith('admin-session-token-')) {
        socket.user = {
          id: 'admin-1',
          role: 'admin',
          email: 'admin@skillbridge.ai',
        };
        return next();
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

    // Real-Time Private Video Interview Room Socket Handlers
    socket.on('room:join', (data) => {
      if (data?.roomId) {
        const interviewRoomName = `interview:${data.roomId}`;
        socket.join(interviewRoomName);
        socket.currentInterviewRoom = data.roomId;
        logger.info(`Participant ${socket.user.id} (${data.name || socket.user.role}) joined interview room: ${interviewRoomName}`);
        
        io.to(interviewRoomName).emit('room:user-joined', {
          socketId: socket.id,
          userId: socket.user.id,
          name: data.name,
          role: socket.user.role,
        });
      }
    });

    socket.on('room:left', (data) => {
      const roomToLeave = data?.roomId || socket.currentInterviewRoom;
      if (roomToLeave) {
        const interviewRoomName = `interview:${roomToLeave}`;
        socket.leave(interviewRoomName);
        io.to(interviewRoomName).emit('room:user-left', {
          userId: socket.user.id,
          socketId: socket.id,
        });
      }
    });

    socket.on('room:media-status', (data) => {
      if (data?.roomId) {
        io.to(`interview:${data.roomId}`).emit('room:media-status', {
          userId: socket.user.id,
          micOn: data.micOn,
          cameraOn: data.cameraOn,
          isHandRaised: data.isHandRaised,
          isScreenSharing: data.isScreenSharing,
        });
      }
    });

    socket.on('room:chat', async (data) => {
      if (data?.roomId && data?.text) {
        const chatMsg = {
          senderId: socket.user.id,
          senderName: data.senderName || 'Participant',
          role: socket.user.role,
          text: data.text,
          timestamp: new Date().toISOString(),
        };

        io.to(`interview:${data.roomId}`).emit('room:chat', chatMsg);

        // Persist message to MongoDB asynchronously
        try {
          await InterviewRoom.updateOne(
            { $or: [{ roomId: data.roomId }, { uuid: data.roomId }] },
            { $push: { chatMessages: chatMsg } }
          );
        } catch (err) {
          logger.error(`Error saving room chat message to DB: ${err.message}`);
        }
      }
    });

    // Real-Time Shared Whiteboard Sync Handlers
    socket.on('whiteboard:draw', (data) => {
      if (data?.roomId && data?.drawData) {
        socket.to(`interview:${data.roomId}`).emit('whiteboard:draw', data.drawData);
      }
    });

    socket.on('whiteboard:clear', (data) => {
      if (data?.roomId) {
        io.to(`interview:${data.roomId}`).emit('whiteboard:clear');
      }
    });

    // Real-Time Shared Live Coding Editor Sync Handlers
    socket.on('code:sync', (data) => {
      if (data?.roomId) {
        socket.to(`interview:${data.roomId}`).emit('code:sync', {
          codeSnippet: data.codeSnippet,
          codeLanguage: data.codeLanguage,
          senderId: socket.user.id,
        });
      }
    });

    socket.on('room:end', (data) => {
      if (data?.roomId) {
        io.to(`interview:${data.roomId}`).emit('room:end', {
          endedBy: socket.user.id,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // WebRTC Peer-to-Peer Signaling Handlers
    socket.on('signal:offer', (data) => {
      if (data?.roomId && data?.sdp) {
        socket.to(`interview:${data.roomId}`).emit('signal:offer', {
          sdp: data.sdp,
          senderId: socket.user.id,
        });
      }
    });

    socket.on('signal:answer', (data) => {
      if (data?.roomId && data?.sdp) {
        socket.to(`interview:${data.roomId}`).emit('signal:answer', {
          sdp: data.sdp,
          senderId: socket.user.id,
        });
      }
    });

    socket.on('signal:ice-candidate', (data) => {
      if (data?.roomId && data?.candidate) {
        socket.to(`interview:${data.roomId}`).emit('signal:ice-candidate', {
          candidate: data.candidate,
          senderId: socket.user.id,
        });
      }
    });

    // Client event: Delete notification
    socket.on('notification:delete', async (data) => {
      logger.info(`Socket event [notification:delete] received from user ${socket.user.id}`, data);
      socket.emit('notification:delete_ack', { success: true, notificationId: data?.notificationId });
    });

    // Proctoring Integrity & Audit Logging Handlers
    socket.on('record:integrity-event', async (data) => {
      if (data?.roomId && data?.eventType) {
        const integrityEntry = {
          eventType: data.eventType,
          timestamp: new Date(),
          details: data.details || '',
          userRole: socket.user?.role || 'candidate',
        };
        try {
          await InterviewRoom.updateOne(
            { $or: [{ roomId: data.roomId }, { uuid: data.roomId }] },
            { $push: { integrityLog: integrityEntry } }
          );
          io.to(`interview:${data.roomId}`).emit('room:integrity-warning', {
            userId: socket.user?.id,
            userRole: socket.user?.role,
            eventType: data.eventType,
            details: data.details,
          });
        } catch (err) {
          logger.error(`Error saving integrity log: ${err.message}`);
        }
      }
    });

    socket.on('record:audit-event', async (data) => {
      if (data?.roomId && data?.eventType) {
        const auditEntry = {
          eventType: data.eventType,
          timestamp: new Date(),
          details: data.details || '',
          userRole: socket.user?.role || '',
        };
        try {
          await InterviewRoom.updateOne(
            { $or: [{ roomId: data.roomId }, { uuid: data.roomId }] },
            { $push: { auditLog: auditEntry } }
          );
        } catch (err) {
          logger.error(`Error saving audit log: ${err.message}`);
        }
      }
    });

    // Disconnect Handling
    socket.on('disconnect', (reason) => {
      if (socket.currentInterviewRoom) {
        io.to(`interview:${socket.currentInterviewRoom}`).emit('room:user-left', {
          userId: socket.user.id,
          socketId: socket.id,
        });
      }
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
