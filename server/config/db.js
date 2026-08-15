import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

import { Candidate } from '../models/candidate.model.js';
import { Company } from '../models/company.model.js';
import { Job } from '../models/job.model.js';
import { Application } from '../models/application.model.js';
import { Interview } from '../models/interview.model.js';
import { Notification } from '../models/notification.model.js';
import { SavedJob } from '../models/savedJob.model.js';
import { ResumeAnalysis } from '../models/resumeAnalysis.model.js';
import { InterviewSession } from '../models/interviewSession.model.js';
import { AuditLog } from '../models/auditLog.model.js';
import { CodingAssessment } from '../models/codingAssessment.model.js';
import { Document } from '../models/document.model.js';
import { Employee } from '../models/employee.model.js';
import { InterviewRoom } from '../models/interviewRoom.model.js';
import { OfferLetter } from '../models/offerLetter.model.js';
import { Session } from '../models/session.model.js';
import { VideoInterview } from '../models/videoInterview.model.js';

// Configure DNS fallback to ensure MongoDB Atlas SRV resolution works across all network adapters
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // Ignore DNS override errors if environment restricts DNS configuration
}

// Disable Mongoose command buffering so queries fail fast if DB is disconnected
mongoose.set('bufferCommands', false);

/**
 * Automatically create all required collections and sync indexes
 */
export const initCollectionsAndIndexes = async () => {
  try {
    const models = [
      Candidate,
      Company,
      Job,
      Application,
      Interview,
      Notification,
      SavedJob,
      ResumeAnalysis,
      InterviewSession,
      AuditLog,
      CodingAssessment,
      Document,
      Employee,
      InterviewRoom,
      OfferLetter,
      Session,
      VideoInterview,
    ];

    for (const model of models) {
      if (model && model.createCollection) {
        await model.createCollection().catch(() => {}); // ignore if collection already exists
        await model.createIndexes().catch(() => {});
      }
    }
    logger.info('✅ All MongoDB collections and indexes initialized successfully.');
  } catch (err) {
    logger.warn(`⚠️ Collection/Index Initialization Warning: ${err.message}`);
  }
};

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);

    // Auto-initialize collections & indexes
    await initCollectionsAndIndexes();

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB Connection Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB Connection Disconnected. Reconnecting...');
    });

    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);

    if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      logger.warn(
        '⚠️ Database Authentication Failed: Bad auth credentials or invalid database name in MONGODB_URI.'
      );
    }

    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
