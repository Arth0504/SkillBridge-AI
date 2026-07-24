import { AuditLog } from '../models/auditLog.model.js';
import { Candidate } from '../models/candidate.model.js';
import { Company } from '../models/company.model.js';

/**
 * Audit Analytics & Security Event Aggregator Service
 */
export const getAuditAnalyticsService = async () => {
  const [
    totalLogins,
    failedLogins,
    lockedAccounts,
    securityBreaches,
    totalCandidates,
    totalCompanies,
    recentSecurityEvents,
  ] = await Promise.all([
    AuditLog.countDocuments({ action: 'LOGIN_SUCCESS' }),
    AuditLog.countDocuments({ action: 'LOGIN_FAILED' }),
    AuditLog.countDocuments({ action: 'ACCOUNT_LOCKED' }),
    AuditLog.countDocuments({ action: 'SECURITY_BREACH_DETECTED' }),
    Candidate.countDocuments({}),
    Company.countDocuments({}),
    AuditLog.find({ status: { $in: ['FAILURE', 'WARNING'] } })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  return {
    authentication: {
      totalSuccessfulLogins: totalLogins,
      totalFailedLogins: failedLogins,
      totalAccountLockouts: lockedAccounts,
      totalSecurityBreachesDetected: securityBreaches,
    },
    platformUsers: {
      candidatesCount: totalCandidates,
      companiesCount: totalCompanies,
    },
    recentSecurityAlerts: recentSecurityEvents.map((evt) => ({
      id: evt._id,
      action: evt.action,
      ipAddress: evt.ipAddress,
      status: evt.status,
      details: evt.details,
      timestamp: evt.createdAt,
    })),
  };
};
