import { getIO } from '../sockets/notification.socket.js';
import { logger } from './logger.js';
import { AuditLog } from '../models/auditLog.model.js';
import { requestContextStore } from '../middleware/context.middleware.js';
import { ipLocation } from './geo.js';

/**
 * Maps model changes to exact enterprise audit action verbs
 */
export const mapModelAction = (modelName, op, doc) => {
  if (modelName === 'Job') {
    if (op === 'create') return 'JOB_CREATED';
    if (op === 'delete') return 'JOB_DELETED';
    if (op === 'update') {
      if (doc?.status === 'closed' || doc?.status === 'CLOSED') return 'JOB_CLOSED';
      return 'JOB_UPDATED';
    }
  }
  if (modelName === 'Application') {
    if (op === 'create') return 'APPLICATION_APPLIED';
    if (op === 'delete') return 'APPLICATION_DELETED';
    if (op === 'update') {
      if (doc?.status === 'Withdrawn') return 'APPLICATION_WITHDRAWN';
      if (doc?.status === 'Shortlisted') return 'APPLICATION_SHORTLISTED';
      if (doc?.status === 'Rejected') return 'APPLICATION_REJECTED';
      if (doc?.status === 'Selected') return 'APPLICATION_SELECTED';
      return 'APPLICATION_STAGE_CHANGED';
    }
  }
  if (modelName === 'Interview') {
    if (op === 'create') return 'INTERVIEW_SCHEDULED';
    if (op === 'delete') return 'INTERVIEW_DELETED';
    if (op === 'update') {
      if (doc?.status === 'Live') return 'INTERVIEW_STARTED';
      if (doc?.status === 'Completed') return 'INTERVIEW_COMPLETED';
      if (doc?.status === 'Cancelled') return 'INTERVIEW_CANCELLED';
      if (doc?.status === 'Rescheduled') return 'INTERVIEW_RESCHEDULED';
      return 'INTERVIEW_UPDATED';
    }
  }
  if (modelName === 'OfferLetter') {
    if (op === 'create') return 'OFFER_LETTER_GENERATED';
    if (op === 'update') {
      if (doc?.status === 'sent') return 'OFFER_SENT';
      if (doc?.status === 'accepted') return 'OFFER_ACCEPTED';
      if (doc?.status === 'declined') return 'OFFER_REJECTED';
      return 'OFFER_LETTER_UPDATED';
    }
  }
  if (modelName === 'Candidate') {
    if (op === 'update') return 'PROFILE_UPDATED';
  }
  if (modelName === 'Company') {
    if (op === 'update') return 'PROFILE_UPDATED';
  }
  if (modelName === 'Notification') {
    if (op === 'create') return 'NOTIFICATION_CREATED';
    if (op === 'update' && doc?.isRead) return 'NOTIFICATION_READ';
    if (op === 'delete') return 'NOTIFICATION_DELETED';
  }
  return `${modelName.toUpperCase()}_${op.toUpperCase()}`;
};

export const handleDbChange = (modelName, action, doc, passedContext = null) => {
  // Prevent infinite loops logging the AuditLog writes
  if (modelName === 'AuditLog') {
    return;
  }

  const io = getIO();
  
  const context = passedContext || requestContextStore.getStore();
  const finalIp = context?.ipAddress || '127.0.0.1';
  const { country, city } = ipLocation(finalIp);
  
  const op = action === 'create' ? 'create' : action === 'delete' ? 'delete' : 'update';
  const parsedAction = mapModelAction(modelName, op, doc);

  const actorId = context?.userId || doc?.createdBy || doc?.companyId || doc?.candidateId || doc?.userId || null;
  const actorModel = context?.userId 
    ? (context.role === 'company' ? 'Company' : 'Candidate') 
    : (modelName === 'Company' ? 'Company' : modelName === 'Candidate' ? 'Candidate' : 'Unknown');

  // Construct standard audit document
  const auditData = {
    userId: actorId,
    userModel: actorModel,
    role: context?.role || (actorModel === 'Company' ? 'company' : actorModel === 'Candidate' ? 'candidate' : 'unknown'),
    action: parsedAction,
    targetCollection: modelName,
    targetId: doc?._id || doc?.id || null,
    ipAddress: finalIp,
    userAgent: context?.userAgent || '',
    deviceInfo: {
      browser: context?.browser || 'Unknown',
      os: context?.operatingSystem || 'Unknown',
      device: 'Desktop',
    },
    country,
    city,
    requestId: context?.requestId || '',
    beforeData: doc?._beforeData || null,
    afterData: doc || null,
    metadata: {
      timestamp: new Date(),
      triggeredByMongooseHook: true,
    },
    status: 'SUCCESS',
  };

  // 1. Create database record asynchronously in background
  AuditLog.create(auditData).then((loggedDoc) => {
    logger.debug(`[Audit Logger] Log entry recorded: ${loggedDoc.action} (${loggedDoc._id})`);
    
    // Broadcast realtime updates with the created audit log details
    if (io) {
      const payload = {
        model: modelName,
        action,
        id: doc?._id || doc?.id || null,
        data: loggedDoc,
      };

      io.emit('dashboard:refresh', payload);
      io.emit('analytics:updated', payload);
      io.emit('audit:new', payload);
      io.emit('activity:new', payload);
      io.emit('timeline:new', payload);
    }
  }).catch((err) => {
    logger.warn(`Failed to create database audit log for model ${modelName}: ${err.message}`);
  });

  // Broadcast routing matching general Mongoose changes
  if (io) {
    switch (modelName) {
      case 'Job':
        if (action === 'create') io.emit('job:created', doc);
        else if (action === 'update') io.emit('job:updated', doc);
        else if (action === 'delete') io.emit('job:deleted', doc);
        break;

      case 'Application':
        if (action === 'create') io.emit('application:created', doc);
        else if (action === 'update') io.emit('application:updated', doc);
        else if (action === 'delete') io.emit('application:deleted', doc);
        break;

      case 'Candidate':
        if (action === 'update') io.emit('candidate:updated', doc);
        break;

      case 'Company':
        if (action === 'update') io.emit('company:updated', doc);
        break;

      case 'Interview':
        {
          const status = doc?.status;
          if (status === 'Scheduled' || status === 'Rescheduled') {
            io.emit('interview:scheduled', doc);
          } else if (status === 'Live') {
            io.emit('interview:started', doc);
          } else if (status === 'Completed') {
            io.emit('interview:completed', doc);
          } else if (status === 'Cancelled' || status === 'No Show') {
            io.emit('interview:cancelled', doc);
          } else {
            io.emit('interview:scheduled', doc);
          }
        }
        break;

      case 'OfferLetter':
        {
          const status = doc?.status;
          if (status === 'sent') {
            io.emit('offer:sent', doc);
          } else if (status === 'accepted') {
            io.emit('offer:accepted', doc);
          } else if (status === 'declined') {
            io.emit('offer:rejected', doc);
          } else {
            io.emit('offer:sent', doc);
          }
        }
        break;

      case 'Notification':
        if (action === 'create') io.emit('notification:new', doc);
        break;

      default:
        break;
    }
  }
};

export const realtimeMongoosePlugin = (schema) => {
  // Capture whether it was a new doc & save request context synchronously
  schema.pre('save', async function (next) {
    this._wasNew = this.isNew;
    
    const context = requestContextStore.getStore();
    if (context) {
      this._requestContext = context;
    }

    if (!this.isNew) {
      try {
        // Fetch old state before save for auditing diffs
        this._beforeData = await this.constructor.findById(this._id).lean();
      } catch (e) {
        // ignore
      }
    }
    next();
  });

  schema.post('save', function (doc) {
    const isNew = doc._wasNew || false;
    const context = doc._requestContext || requestContextStore.getStore();
    handleDbChange(this.constructor.modelName, isNew ? 'create' : 'update', doc, context);
  });

  schema.post('insertMany', function (docs) {
    if (Array.isArray(docs)) {
      const context = requestContextStore.getStore();
      docs.forEach((doc) => {
        handleDbChange(doc.constructor.modelName, 'create', doc, context);
      });
    }
  });

  // Query pre-hooks to inject context synchronously
  const queryPreHooks = ['updateOne', 'updateMany', 'findOneAndUpdate', 'findByIdAndUpdate', 'deleteOne', 'deleteMany', 'findOneAndDelete', 'findByIdAndDelete'];
  queryPreHooks.forEach((hookName) => {
    schema.pre(hookName, function (next) {
      const context = requestContextStore.getStore();
      if (context) {
        this.options._requestContext = context;
      }
      next();
    });
  });

  // Query update post-hooks
  const queryUpdateHooks = ['updateOne', 'updateMany', 'findOneAndUpdate', 'findByIdAndUpdate'];
  queryUpdateHooks.forEach((hookName) => {
    schema.post(hookName, function (res) {
      const context = this.options?._requestContext || requestContextStore.getStore();
      const isDoc = res && res._id;
      handleDbChange(this.model.modelName, 'update', isDoc ? res : { filter: this.getQuery() }, context);
    });
  });

  // Query delete post-hooks
  const queryDeleteHooks = ['deleteOne', 'deleteMany', 'findOneAndDelete', 'findByIdAndDelete', 'remove'];
  queryDeleteHooks.forEach((hookName) => {
    schema.post(hookName, function (res) {
      const context = this.options?._requestContext || requestContextStore.getStore();
      const isDoc = res && res._id;
      handleDbChange(this.model.modelName, 'delete', isDoc ? res : { filter: this.getQuery() }, context);
    });
  });
};
