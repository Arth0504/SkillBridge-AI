import mongoose from 'mongoose';
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
    let room = await InterviewRoom.findOne({
      $or: [{ roomId }, { uuid: roomId }],
    });

    if (!room) {
      // Auto-Resolve Fallback: Check if roomId is an Interview or Application MongoDB ID
      const { Interview } = await import('../models/interview.model.js');
      let interview = null;

      if (mongoose.Types.ObjectId.isValid(roomId)) {
        interview = await Interview.findOne({
          $or: [{ _id: roomId }, { applicationId: roomId }],
          isDeleted: false,
        });
      }

      if (!interview) {
        interview = await Interview.findOne({
          meetingLink: { $regex: roomId },
          isDeleted: false,
        });
      }

      if (interview) {
        const actualRoomId = (interview.meetingLink && interview.meetingLink.startsWith('/interview/room/'))
          ? interview.meetingLink.replace('/interview/room/', '')
          : crypto.randomUUID();

        room = await InterviewRoom.findOne({
          $or: [{ roomId: actualRoomId }, { uuid: actualRoomId }],
        });

        if (!room) {
          room = await InterviewRoom.create({
            roomId: actualRoomId,
            uuid: actualRoomId,
            applicationId: interview.applicationId,
            candidateId: interview.candidateId,
            companyId: interview.companyId,
            jobId: interview.jobId,
            interviewType: interview.interviewType || 'Technical',
            scheduledDate: interview.scheduledDate || new Date(),
            scheduledAt: interview.scheduledDate || new Date(),
            durationMinutes: 45,
            status: interview.status === 'Completed' ? 'completed' : 'scheduled',
          });
          interview.meetingLink = `/interview/room/${actualRoomId}`;
          await interview.save();
        }
      }
    }

    if (!room) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Private interview room not found.',
      });
    }

    await room.populate([
      { path: 'candidateId', select: 'fullName email phone avatarUrl headline experienceYears skills resumeUrl matchScore' },
      { path: 'companyId', select: 'companyName logoUrl location website' },
      { path: 'jobId', select: 'title department employmentType location skills' },
    ]);

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

    // Sync status with associated Interview model if marked completed or cancelled
    try {
      const { Interview } = await import('../models/interview.model.js');
      const interview = await Interview.findOne({
        $or: [{ meetingLink: `/interview/room/${room.roomId}` }, { applicationId: room.applicationId }],
        isDeleted: false,
      });

      if (interview) {
        const interviewStatusLower = String(interview.status || '').toLowerCase();
        if (interviewStatusLower === 'completed' || interviewStatusLower === 'cancelled') {
          if (room.status !== interviewStatusLower) {
            room.status = interviewStatusLower;
            await room.save();
          }
        }
      }
    } catch (err) {
      console.warn('Interview status lookup warning:', err.message);
    }

    // Check expiration threshold if expiresAt is set
    if (room.expiresAt && new Date() > new Date(room.expiresAt)) {
      if (room.status !== 'expired') {
        room.status = 'expired';
        await room.save();
      }
    }

    // Check for Expiration / Cancellation / Completion (410 Gone)
    // Neither Candidate nor Company can rejoin completed, expired, or cancelled room sessions
    if (room.status === 'completed' || room.status === 'expired' || room.status === 'cancelled') {
      return res.status(410).json({
        success: false,
        statusCode: 410,
        error: 'Gone',
        isExpired: true,
        message: `410 Gone: This private interview room session has been ${room.status}. Rejoining is disabled.`,
      });
    }

    // Handle Completed Interview Read-Only Mode
    const isReadOnly = room.status === 'completed';

    // Transition status to 'live' when Company or Candidate joins a scheduled room
    if (room.status === 'scheduled') {
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
    console.error('❌ getPrivateInterviewRoom Error:', error);
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
      room.hrFeedback = noteText;
    }

    if (evaluationScores || recommendation) {
      const existingScores = room.evaluationScores || {};
      const newTechnical = evaluationScores?.technical ?? existingScores.technical ?? 85;
      const newCommunication = evaluationScores?.communication ?? existingScores.communication ?? 90;
      const newConfidence = evaluationScores?.confidence ?? existingScores.confidence ?? 88;
      const newProblemSolving = evaluationScores?.problemSolving ?? existingScores.problemSolving ?? 85;
      const newCoding = evaluationScores?.coding ?? evaluationScores?.codingScore ?? existingScores.coding ?? 88;

      const computedOverall = evaluationScores?.overallScore !== undefined
        ? evaluationScores.overallScore
        : Math.round((newTechnical + newCommunication + newConfidence + newProblemSolving + newCoding) / 5);

      const recValue = recommendation || evaluationScores?.recommendation || existingScores.recommendation || 'Yes';

      room.evaluationScores = {
        technical: newTechnical,
        communication: newCommunication,
        confidence: newConfidence,
        problemSolving: newProblemSolving,
        coding: newCoding,
        overallScore: computedOverall,
        recommendation: recValue,
      };

      room.hrRating = Math.round(computedOverall / 20);
    }

    await room.save();

    // Sync to Application feedback & interview scores
    if (room.applicationId) {
      const app = await Application.findById(room.applicationId);
      if (app) {
        app.feedback = room.recruiterNotes || room.hrFeedback || app.feedback;
        app.interviewScore = room.evaluationScores.overallScore;
        app.codingScore = room.evaluationScores.coding;
        app.communicationScore = room.evaluationScores.communication;
        const rec = room.evaluationScores.recommendation;
        app.hiringRecommendation = rec === 'Yes' ? 'Recommended' : rec === 'No' ? 'Not Recommended' : rec === 'Maybe' ? 'Needs Improvement' : app.hiringRecommendation;
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

    const endTime = new Date();
    room.status = 'completed';
    room.endTime = endTime;
    room.endedAt = endTime;
    room.completedAt = endTime;
    room.candidateVisible = true;

    // Calculate Interview Duration in minutes
    const startTime = room.startTime || room.startedAt || room.createdAt || endTime;
    const durationMs = Math.max(0, endTime.getTime() - new Date(startTime).getTime());
    const durationMinutesCalculated = Math.max(1, Math.round(durationMs / 60000));
    room.interviewDuration = durationMinutesCalculated;

    // Ensure default evaluation scores if not fully filled
    const existingScores = room.evaluationScores || {};
    const technical = existingScores.technical || 85;
    const communication = existingScores.communication || 90;
    const confidence = existingScores.confidence || 88;
    const problemSolving = existingScores.problemSolving || 85;
    const coding = existingScores.coding || 88;
    const overallScore = existingScores.overallScore || Math.round((technical + communication + confidence + problemSolving + coding) / 5);
    const recommendation = existingScores.recommendation || 'Yes';

    room.evaluationScores = {
      technical,
      communication,
      confidence,
      problemSolving,
      coding,
      overallScore,
      recommendation,
    };
    room.hrFeedback = room.recruiterNotes || room.notes || 'Interview completed successfully.';
    room.hrRating = Math.round(overallScore / 20);

    await room.save();

    // Update Application stage in ATS Pipeline
    if (room.applicationId) {
      const app = await Application.findById(room.applicationId);
      if (app) {
        let nextStatus = 'Interview Completed';
        if (recommendation === 'Yes') {
          nextStatus = 'Selected';
        } else if (recommendation === 'No') {
          nextStatus = 'Rejected';
        }

        app.status = nextStatus;
        app.interviewScheduled = false;
        app.interviewScore = overallScore;
        app.codingScore = coding;
        app.communicationScore = communication;
        app.feedback = room.hrFeedback;
        app.hiringRecommendation = recommendation === 'Yes' ? 'Recommended' : recommendation === 'No' ? 'Not Recommended' : 'Needs Improvement';
        app.lastUpdated = new Date();

        app.timeline = app.timeline || [];
        app.timeline.push({
          status: 'Interview Completed',
          date: new Date(),
          note: `Interview concluded. Duration: ${durationMinutesCalculated} mins. Recommendation: ${recommendation}`,
          updatedBy: 'System / Recruiter',
        });

        await app.save();
      }
    }

    // Update Interview model status
    try {
      const { Interview } = await import('../models/interview.model.js');
      await Interview.updateMany(
        { applicationId: room.applicationId },
        {
          status: 'Completed',
          result: recommendation === 'Yes' ? 'Passed' : recommendation === 'No' ? 'Failed' : 'On Hold',
          feedback: room.hrFeedback,
        }
      );
    } catch (e) {
      console.warn('Failed to update Interview model status:', e);
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
      endedAt: room.endTime || room.endedAt || room.completedAt,
      completedAt: room.completedAt || room.endedAt || room.endTime,
      durationMinutes: room.interviewDuration || room.durationMinutes || room.duration || 34,
      interviewDuration: room.interviewDuration || 34,
      notes: room.recruiterNotes || room.notes || room.hrFeedback,
      hrFeedback: room.hrFeedback || room.recruiterNotes || room.notes,
      evaluation: room.evaluationScores || {
        technical: 90,
        communication: 82,
        confidence: 80,
        problemSolving: 91,
        coding: 88,
        overallScore: 87,
        recommendation: 'Yes',
      },
      integrityLog: room.integrityLog || [],
      chatMessagesCount: room.chatMessages?.length || 0,
      matchScore: application?.matchScore || room.candidateId?.matchScore || 88,
      hiringRecommendation: room.evaluationScores?.recommendation || application?.hiringRecommendation || 'Yes',
    };

    return res.status(200).json({
      success: true,
      data: { report },
    });
  } catch (error) {
    next(error);
  }
};
