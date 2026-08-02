import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  schedulePrivateInterview,
  getPrivateInterviewRoom,
  updateRoomNotesAndScores,
  endPrivateInterview,
  getInterviewReport,
} from '../controllers/interviewRoom.controller.js';

const router = express.Router();

// Require authentication for all private video room endpoints
router.use(authenticate);

// Schedule private room (returns UUID room link)
router.post('/schedule', schedulePrivateInterview);

// Get room details & validate user participant access (403 Forbidden / 410 Gone / 200 OK)
router.get('/room/:roomId', getPrivateInterviewRoom);

// Save recruiter notes & evaluation scores
router.post('/room/:roomId/notes', updateRoomNotesAndScores);

// End interview session
router.post('/room/:roomId/end', endPrivateInterview);

// Get structured post-interview evaluation report
router.get('/room/:roomId/report', getInterviewReport);

export default router;
