import express from 'express';
import {
  getAuditLogs,
  exportAuditLogsCsv,
  exportAuditLogsPdf,
} from '../controllers/auditLog.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkDbConnection } from '../middleware/db.middleware.js';

const router = express.Router();

// Mount all routes guarded by DB connection check & authentication
router.get('/', checkDbConnection, protect, getAuditLogs);
router.get('/export/csv', checkDbConnection, protect, exportAuditLogsCsv);
router.get('/export/pdf', checkDbConnection, protect, exportAuditLogsPdf);

export default router;
