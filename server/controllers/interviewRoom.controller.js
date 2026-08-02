import crypto from 'crypto';
import { InterviewRoom } from '../models/interviewRoom.model.js';
import { Application } from '../models/application.model.js';
import { Candidate } from '../models/candidate.model.js';
import { Job } from '../models/job.model.js';
import { Company } from '../models/company.model.js';
import { emailAutomationService } from '../services/emailAutomation.service.js';
import { createNotificationService } from '../services/notification.service.js';
import { NOTIFICATION_TYPES } from '../models/notification.model.js';
import { getIO } from '../sockets/notification.socket.js';

/**
 * Schedule a new private interview room
 * POST /api/v1/interviews/private/schedule
 */
export const schedulePrivateInterview = async (req, res, next) => {
  try {
    const companyId = req.user.companyId || req.user._id;
    const { applicationId, scheduledDate, durationMinutes, duration, interviewType, notes } = req.body;

    const application = await Application.findById(applicationId)
      .populate('candidateId')
      .populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application record not found.',
      });
    }

    if (application.companyId.toString() !== companyId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this candidate application.',
      });
    }

    // Generate secure UUID room ID (Never expose MongoDB _id)
    const roomId = crypto.randomUUID();
    const scheduledTime = scheduledDate ? new Date(scheduledDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const sessionDuration = Number(durationMinutes || duration || 45);

    const room = await InterviewRoom.create({
      roomId,
      uuid: roomId,
      applicationId: application._id,
      candidateId: application.candidateId._id,
      companyId: application.companyId,
      jobId: application.jobId._id,
      interviewType: interviewType || 'Technical',
      scheduledDate: scheduledTime,
      scheduledAt: scheduledTime,
      durationMinutes: sessionDuration,
      duration: sessionDuration,
      status: 'scheduled',
      recruiterNotes: notes || '',
      notes: notes || '',
    });

    // Update Application state
    application.status = 'Interview Scheduled';
    application.interviewDate = room.scheduledDate;
    await application.save();

    const candidate = application.candidateId;
    const job = application.jobId;
    const company = await Company.findById(application.companyId);

    // Send Real-Time Socket Notification to Candidate
    if (candidate) {
      createNotificationService({
        receiverId: candidate._id,
        receiverRole: 'candidate',
        senderId: companyId,
        senderRole: 'company',
        title: 'Private Video Interview Scheduled',
        message: `An interview for position "${job?.title || 'Job'}" has been scheduled.`,
        type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
        priority: 'urgent',
        metadata: {
          roomId: room.roomId,
          roomUrl: `/interview/room/${room.roomId}`,
          scheduledDate: room.scheduledDate,
        },
      }).catch((err) => console.error('Error creating in-app notification:', err));
    }

    // Send Interview Invitation Email with internal room link
    if (candidate && candidate.email) {
      emailAutomationService.sendInterviewInvitationEmail(candidate, {
        jobTitle: job?.title || 'Position',
        companyName: company?.companyName || 'SkillBridge AI Enterprise',
        scheduledDate: room.scheduledDate,
        durationMinutes: room.durationMinutes,
        interviewType: room.interviewType,
        roomUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/interview/room/${room.roomId}`,
      }).catch((err) => console.error('Error dispatching interview email:', err));
    }

    return res.status(201).json({
      success: true,
      message: 'Private interview room scheduled successfully.',
      data: {
        roomId: room.roomId,
        uuid: room.roomId,
        roomUrl: `/interview/room/${room.roomId}`,
        interview: room,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get private interview room details & participant authorization check
 * GET /api/v1/interviews/private/room/:roomId
 */
export const getPrivateInterviewRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Search by roomId or uuid
    const room = await InterviewRoom.findOne({
      $or: [{ roomId }, { uuid: roomId }],
    })
      .populate('candidateId', 'fullName email phone avatarUrl headline experienceYears skills resumeUrl matchScore')
      .populate('companyId', 'companyName logoUrl location website')
      .populate('jobId', 'title department employmentType location skills');

    if (!room) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Private interview room not found.',
      });
    }

    // Access Control Validation: Strict check (403 Forbidden)
    const hasAccess = room.hasUserAccess(userId, userRole);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        error: 'Forbidden',
        message: '403 Forbidden: You are not authorized to access this private interview room.',
      });
    }

    // Check for Expiration (410 Gone)
    const scheduledTime = new Date(room.scheduledDate || room.scheduledAt || room.createdAt).getTime();
    const durationMs = (room.durationMinutes || room.duration || 45) * 60 * 1000;
    const expirationBufferMs = 120 * 60 * 1000; // 2 hours window
    const isPastExpiration = Date.now() > scheduledTime + durationMs + expirationBufferMs;

    if (room.status === 'expired' || (room.status === 'scheduled' && isPastExpiration)) {
      if (room.status !== 'expired') {
        room.status = 'expired';
        await room.save();
      }
      return res.status(410).json({
        success: false,
        statusCode: 410,
        error: 'Gone',
        isExpired: true,
        message: '410 Gone: This private interview room session link has expired.',
      });
    }

    // Handle Completed Interview Read-Only Mode
    const isReadOnly = room.status === 'completed';

    // Update status to 'live' if transitioning from 'scheduled'
    if (room.status === 'scheduled' && !isPastExpiration) {
      room.status = 'live';
      room.startTime = room.startTime || new Date();
      room.startedAt = room.startedAt || new Date();
      await room.save();
    }

    // Fetch associated application
    const application = await Application.findById(room.applicationId);

    return res.status(200).json({
      success: true,
      data: {
        room,
        application,
        userRole,
        isReadOnly,
        currentUser: {
          id: userId,
          name: req.user.fullName || req.user.companyName || 'Participant',
          role: userRole,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save recruiter notes & evaluation scores
 * POST /api/v1/interviews/private/room/:roomId/notes
 */
export const updateRoomNotesAndScores = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { recruiterNotes, notes, evaluationScores, recommendation } = req.body;

    const room = await InterviewRoom.findOne({
      $or: [{ roomId }, { uuid: roomId }],
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Interview room not found.',
      });
    }

    const noteText = recruiterNotes !== undefined ? recruiterNotes : notes;
    if (noteText !== undefined) {
      room.recruiterNotes = noteText;
      room.notes = noteText;
    }

    if (evaluationScores || recommendation) {
      const existingScores = room.evaluationScores || {};
      const newTechnical = evaluationScores?.technical ?? existingScores.technical ?? 0;
      const newCommunication = evaluationScores?.communication ?? existingScores.communication ?? 0;
      const newConfidence = evaluationScores?.confidence ?? existingScores.confidence ?? 0;
      const newProblemSolving = evaluationScores?.problemSolving ?? existingScores.problemSolving ?? 0;

      const computedOverall = evaluationScores?.overallScore !== undefined
        ? evaluationScores.overallScore
        : Math.round((newTechnical + newCommunication + newConfidence + newProblemSolving) / 4);

      room.evaluationScores = {
        technical: newTechnical,
        communication: newCommunication,
        confidence: newConfidence,
        problemSolving: newProblemSolving,
        overallScore: computedOverall,
        recommendation: recommendation || evaluationScores?.recommendation || existingScores.recommendation || '',
      };
    }

    await room.save();

    // Update Application feedback & interview score
    if (room.applicationId) {
      const app = await Application.findById(room.applicationId);
      if (app) {
        app.feedback = room.recruiterNotes;
        app.interviewScore = room.evaluationScores.overallScore;
        await app.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Recruiter notes and evaluation scores saved live.',
      data: { room },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * End Private Interview Session
 * POST /api/v1/interviews/private/room/:roomId/end
 */
export const endPrivateInterview = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await InterviewRoom.findOne({
      $or: [{ roomId }, { uuid: roomId }],
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Interview room not found.',
      });
    }

    room.status = 'completed';
    room.endTime = new Date();
    room.endedAt = new Date();
    await room.save();

    // Update application stage to Interview Completed
    if (room.applicationId) {
      await Application.findByIdAndUpdate(room.applicationId, {
        status: 'Interview Completed',
      });
    }

    // Notify room participants over Socket.IO
    const io = getIO();
    if (io) {
      io.to(`interview:${room.roomId}`).emit('room:end', {
        endedBy: req.user._id,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Private interview room concluded successfully.',
      data: { room },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Interview Summary Report
 * GET /api/v1/interviews/private/room/:roomId/report
 */
export const getInterviewReport = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await InterviewRoom.findOne({
      $or: [{ roomId }, { uuid: roomId }],
    })
      .populate('candidateId', 'fullName email phone headline skills experienceYears resumeUrl avatarUrl matchScore')
      .populate('companyId', 'companyName logoUrl location website')
      .populate('jobId', 'title department employmentType location skills');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Interview room not found.',
      });
    }

    const application = await Application.findById(room.applicationId);

    const report = {
      roomId: room.roomId,
      interviewType: room.interviewType,
      status: room.status,
      candidate: room.candidateId,
      company: room.companyId,
      job: room.jobId,
      scheduledAt: room.scheduledDate || room.scheduledAt,
      startedAt: room.startTime || room.startedAt,
      endedAt: room.endTime || room.endedAt,
      durationMinutes: room.durationMinutes || room.duration,
      notes: room.recruiterNotes || room.notes,
      evaluation: room.evaluationScores,
      chatMessagesCount: room.chatMessages?.length || 0,
      matchScore: application?.matchScore || room.candidateId?.matchScore || 88,
    };

    return res.status(200).json({
      success: true,
      data: { report },
    });
  } catch (error) {
    next(error);
  }
};
