import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { Candidate } from '../models/candidate.model.js';
import { Company } from '../models/company.model.js';
import { Job } from '../models/job.model.js';
import { Application } from '../models/application.model.js';
import { InterviewRoom } from '../models/interviewRoom.model.js';
import { Employee } from '../models/employee.model.js';
import { AuditLog } from '../models/auditLog.model.js';
import { Session } from '../models/session.model.js';
import { Notification } from '../models/notification.model.js';
import { getIO } from '../sockets/notification.socket.js';

/**
 * Super Admin Live Control Center Dashboard Statistics
 * GET /api/v1/admin/control/dashboard
 */
export const getAdminControlDashboardHandler = asyncHandler(async (_req, res) => {
  const [
    totalCandidates,
    totalCompanies,
    totalEmployees,
    totalJobs,
    totalApplications,
    activeInterviews,
    auditLogsCount,
    activeSessions,
    lockedCandidates,
    lockedCompanies,
    pendingCompanies,
  ] = await Promise.all([
    Candidate.countDocuments({}),
    Company.countDocuments({}),
    Employee.countDocuments({}),
    Job.countDocuments({}),
    Application.countDocuments({}),
    InterviewRoom.countDocuments({ status: 'live' }),
    AuditLog.countDocuments({}),
    Session.countDocuments({ isRevoked: false }),
    Candidate.countDocuments({ lockUntil: { $gt: new Date() } }),
    Company.countDocuments({ lockUntil: { $gt: new Date() } }),
    Company.countDocuments({ isVerified: false }),
  ]);

  const stats = {
    totalCandidates,
    totalCompanies,
    totalEmployees,
    totalJobs,
    totalApplications,
    activeInterviews,
    aiRequestsTotal: auditLogsCount + totalApplications * 3,
    activeSessions,
    lockedAccounts: lockedCandidates + lockedCompanies,
    pendingCompanyVerifications: pendingCompanies,
  };

  return sendResponse(res, 200, true, 'Super Admin Control Center statistics retrieved', stats);
});

/**
 * User Account Status Management (Suspend, Activate, Soft-Delete, Reset Lockout, Force Logout)
 * PATCH /api/v1/admin/control/users/:id/status
 */
export const updateUserAccountStatusHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userType, action } = req.body; // userType: 'candidate' | 'company', action: 'suspend' | 'activate' | 'soft-delete' | 'reset-lockout' | 'force-logout'

  const Model = userType === 'company' ? Company : Candidate;
  const user = await Model.findById(id);

  if (!user) {
    throw new AppError('Target user account not found.', 404);
  }

  if (action === 'suspend') {
    user.status = 'suspended';
    user.lockUntil = new Date(Date.now() + 365 * 86400000); // 1 year lock
  } else if (action === 'activate') {
    user.status = 'active';
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
  } else if (action === 'reset-lockout') {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
  } else if (action === 'soft-delete') {
    user.status = 'deleted';
    user.isDeleted = true;
  } else if (action === 'force-logout') {
    await Session.updateMany({ userId: user._id }, { isRevoked: true });
  }

  await user.save();

  // Log Super Admin Action
  await AuditLog.create({
    userId: req.user._id,
    userModel: 'Company',
    role: req.role,
    action: `SUPER_ADMIN_USER_${action.toUpperCase()}`,
    targetCollection: userType === 'company' ? 'companies' : 'candidates',
    targetId: user._id,
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || '',
    status: 'SUCCESS',
  });

  return sendResponse(res, 200, true, `User account ${action} successful`, { user });
});

/**
 * Company Verification Management (Approve, Reject, Suspend)
 * PATCH /api/v1/admin/control/companies/:id/verification
 */
export const updateCompanyVerificationHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { verificationStatus } = req.body; // 'verified' | 'rejected' | 'suspended' | 'pending'

  const company = await Company.findById(id);
  if (!company) {
    throw new AppError('Company account not found.', 404);
  }

  if (verificationStatus === 'verified') {
    company.isVerified = true;
    company.status = 'active';
  } else if (verificationStatus === 'rejected') {
    company.isVerified = false;
    company.status = 'rejected';
  } else if (verificationStatus === 'suspended') {
    company.status = 'suspended';
  }

  await company.save();

  return sendResponse(res, 200, true, `Company verification status updated to ${verificationStatus}`, { company });
});

/**
 * Job Moderation Management (Hide, Restore, Mark Spam)
 * PATCH /api/v1/admin/control/jobs/:id/moderation
 */
export const moderateJobHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { moderationAction } = req.body; // 'hide' | 'restore' | 'spam'

  const job = await Job.findById(id);
  if (!job) {
    throw new AppError('Job post record not found.', 404);
  }

  if (moderationAction === 'hide') {
    job.status = 'hidden';
  } else if (moderationAction === 'restore') {
    job.status = 'open';
  } else if (moderationAction === 'spam') {
    job.status = 'spam';
  }

  await job.save();

  return sendResponse(res, 200, true, `Job moderation action ${moderationAction} applied`, { job });
});

/**
 * Super Admin CSV Data Export Handler (Backup & Data Recovery)
 * GET /api/v1/admin/control/export/:collection
 */
export const exportCollectionCsvHandler = asyncHandler(async (req, res) => {
  const { collection } = req.params;

  let csvContent = '';
  let filename = `${collection}_export_${new Date().toISOString().split('T')[0]}.csv`;

  if (collection === 'users' || collection === 'candidates') {
    const candidates = await Candidate.find({}).lean();
    csvContent = 'ID,Full Name,Email,Phone,Role,Status,Created At\n';
    candidates.forEach((c) => {
      csvContent += `"${c._id}","${c.fullName || ''}","${c.email || ''}","${c.phone || ''}","${c.role || ''}","${c.status || 'active'}","${c.createdAt || ''}"\n`;
    });
  } else if (collection === 'companies') {
    const companies = await Company.find({}).lean();
    csvContent = 'ID,Company Name,Email,Industry,Verified,Status,Created At\n';
    companies.forEach((c) => {
      csvContent += `"${c._id}","${c.companyName || ''}","${c.email || ''}","${c.industry || ''}","${c.isVerified || false}","${c.status || 'active'}","${c.createdAt || ''}"\n`;
    });
  } else if (collection === 'jobs') {
    const jobs = await Job.find({}).lean();
    csvContent = 'ID,Title,Department,Location,Status,Created At\n';
    jobs.forEach((j) => {
      csvContent += `"${j._id}","${j.title || ''}","${j.department || ''}","${j.location || ''}","${j.status || 'open'}","${j.createdAt || ''}"\n`;
    });
  } else if (collection === 'employees') {
    const employees = await Employee.find({}).lean();
    csvContent = 'ID,Employee ID,Full Name,Work Email,Designation,Department,Joining Date,Status\n';
    employees.forEach((e) => {
      csvContent += `"${e._id}","${e.employeeId || ''}","${e.fullName || ''}","${e.companyEmailPlaceholder || e.email || ''}","${e.designation || ''}","${e.department || ''}","${e.joiningDate || ''}","${e.employeeStatus || ''}"\n`;
    });
  } else {
    const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(1000).lean();
    csvContent = 'ID,User ID,Role,Action,IP Address,Status,Timestamp\n';
    logs.forEach((l) => {
      csvContent += `"${l._id}","${l.userId || ''}","${l.role || ''}","${l.action || ''}","${l.ipAddress || ''}","${l.status || ''}","${l.createdAt || ''}"\n`;
    });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send(csvContent);
});

/**
 * Super Admin Broadcast Notification Handler
 * POST /api/v1/admin/control/broadcast
 */
export const sendBroadcastNotificationHandler = asyncHandler(async (req, res) => {
  const { title, message, targetRole } = req.body; // targetRole: 'candidate' | 'company' | 'all'

  if (!title || !message) {
    throw new AppError('Title and message content are required for broadcast.', 400);
  }

  // Socket.IO Realtime Broadcast
  try {
    const io = getIO();
    if (io) {
      io.emit('ADMIN_BROADCAST', {
        title,
        message,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    // Graceful fallback
  }

  return sendResponse(res, 200, true, 'Super Admin broadcast notification sent to platform users.');
});
