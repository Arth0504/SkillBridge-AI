import { AuditLog } from '../models/auditLog.model.js';
import { sendResponse } from '../utils/sendResponse.js';
import { logger } from '../utils/logger.js';

/**
 * Filter query constructor with enterprise security constraints
 */
const buildAuditQuery = (req) => {
  const query = {};
  const { search, action, role, status, module, startDate, endDate } = req.query;

  // 1. Enforce Role Security Constraints
  if (req.role === 'candidate') {
    query.userId = req.user._id;
  } else if (req.role === 'company') {
    // Company can only see logs they performed or logs on their own company collections
    query.$or = [
      { userId: req.user._id },
      { 'metadata.companyId': req.user._id.toString() },
      { 'beforeData.companyId': req.user._id },
      { 'afterData.companyId': req.user._id }
    ];
  } // admin and super-admin see everything

  // 2. Map filters
  if (action && action !== 'ALL') {
    query.action = action;
  }
  if (role && role !== 'ALL') {
    query.role = role.toLowerCase();
  }
  if (status && status !== 'ALL') {
    query.status = status;
  }
  if (module && module !== 'ALL') {
    query.targetCollection = module;
  }

  // 3. Date range constraints
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // 4. Free text search index query
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { action: searchRegex },
        { role: searchRegex },
        { country: searchRegex },
        { city: searchRegex },
        { ipAddress: searchRegex },
        { userModel: searchRegex }
      ]
    });
  }

  return query;
};

/**
 * Get Audit logs with paging & filters
 * @route GET /api/v1/audit-logs
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = buildAuditQuery(req);

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .lean();

    const total = await AuditLog.countDocuments(query);

    return sendResponse(res, 200, true, 'Audit logs retrieved successfully', {
      logs,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    logger.error(`Error fetching audit logs: ${err.message}`);
    return sendResponse(res, 500, false, `Failed to retrieve audit logs: ${err.message}`);
  }
};

/**
 * Stream audit logs in CSV format
 * @route GET /api/v1/audit-logs/export/csv
 */
export const exportAuditLogsCsv = async (req, res) => {
  try {
    const query = buildAuditQuery(req);
    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).lean();

    // Generate CSV Header
    let csv = 'Timestamp,Actor ID,Role,Action,Module,IP Address,Country,City,Status\n';

    // Populate CSV Rows
    logs.forEach((log) => {
      const timestamp = new Date(log.createdAt).toISOString();
      const userId = log.userId ? log.userId.toString() : 'System';
      const role = log.role || 'system';
      const action = log.action || 'UNKNOWN';
      const module = log.targetCollection || 'General';
      const ip = log.ipAddress || '127.0.0.1';
      const country = log.country || 'Unknown';
      const city = log.city || 'Unknown';
      const status = log.status || 'SUCCESS';

      // Escape quotes/commas
      const cleanAction = action.includes(',') ? `"${action}"` : action;
      csv += `${timestamp},${userId},${role},${cleanAction},${module},${ip},${country},${city},${status}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
    return res.status(200).send(csv);
  } catch (err) {
    logger.error(`Error exporting audit CSV: ${err.message}`);
    return res.status(500).send(`Failed to export CSV: ${err.message}`);
  }
};

/**
 * Generate print-ready HTML layout representing PDF export
 * @route GET /api/v1/audit-logs/export/pdf
 */
export const exportAuditLogsPdf = async (req, res) => {
  try {
    const query = buildAuditQuery(req);
    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(100).lean(); // Cap at top 100 for visual PDF

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Enterprise Security Audit Log Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; }
          h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 5px; }
          p { font-size: 12px; color: #64748b; margin-top: 0; margin-bottom: 25px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
          th { background: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 12px 10px; text-align: left; font-weight: 700; text-transform: uppercase; color: #475569; }
          td { border-bottom: 1px solid #f1f5f9; padding: 10px; color: #334155; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 9px; }
          .badge-success { background: #dcfce7; color: #15803d; }
          .badge-warning { background: #fef9c3; color: #a16207; }
          .badge-danger { background: #fee2e2; color: #b91c1c; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <div>
            <h1>SkillBridge AI Activity Center Report</h1>
            <p>Generated on: ${new Date().toLocaleString()} | Scope: ${req.role.toUpperCase()} View</p>
          </div>
          <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
            Print / Save as PDF
          </button>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Actor ID</th>
              <th>Role</th>
              <th>Module</th>
              <th>Location</th>
              <th>IP Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    logs.forEach((log) => {
      const timestamp = new Date(log.createdAt).toLocaleString();
      const userId = log.userId ? log.userId.toString() : 'System';
      const role = log.role || 'system';
      const action = log.action || 'UNKNOWN';
      const module = log.targetCollection || 'General';
      const ip = log.ipAddress || '127.0.0.1';
      const country = log.country || 'Unknown';
      const city = log.city || 'Unknown';
      const status = log.status || 'SUCCESS';

      const badgeClass = status === 'SUCCESS' ? 'badge-success' : status === 'WARNING' ? 'badge-warning' : 'badge-danger';

      html += `
        <tr>
          <td>${timestamp}</td>
          <td style="font-weight: 700; color: #2563eb;">${action}</td>
          <td>${userId}</td>
          <td>${role}</td>
          <td>${module}</td>
          <td>${city}, ${country}</td>
          <td>${ip}</td>
          <td><span class="badge ${badgeClass}">${status}</span></td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (err) {
    logger.error(`Error exporting audit PDF: ${err.message}`);
    return res.status(500).send(`Failed to export PDF: ${err.message}`);
  }
};
