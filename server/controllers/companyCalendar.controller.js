import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/sendResponse.js';
import { InterviewRoom } from '../models/interviewRoom.model.js';
import { Application } from '../models/application.model.js';
import { OfferLetter } from '../models/offerLetter.model.js';

/**
 * Get Recruiter Calendar Events (Interviews, Meetings, Offer Deadlines, Reminders)
 * @route GET /api/v1/company/calendar
 */
export const getCompanyCalendarHandler = asyncHandler(async (req, res, _next) => {
  const companyId = req.user.companyId || req.user._id;

  // 1. Fetch Scheduled Interview Rooms
  const rooms = await InterviewRoom.find({ companyId })
    .populate('candidateId', 'fullName email')
    .populate('jobId', 'title department')
    .lean();

  // 2. Fetch Offer Letters
  const offers = await OfferLetter.find({ companyId })
    .populate('candidateId', 'fullName email')
    .lean();

  // 3. Transform to unified Calendar Event Format
  const interviewEvents = rooms.map((r) => ({
    id: `interview-${r._id}`,
    title: `${r.interviewType} Interview: ${r.candidateId?.fullName || 'Candidate'}`,
    date: r.scheduledDate || r.scheduledAt || r.createdAt,
    time: new Date(r.scheduledDate || r.scheduledAt || r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: 'interview',
    status: r.status,
    candidateName: r.candidateId?.fullName || 'Candidate',
    jobTitle: r.jobId?.title || 'Job Role',
    roomUrl: `/interview/room/${r.roomId}`,
  }));

  const offerEvents = offers.map((o) => ({
    id: `offer-${o._id}`,
    title: `Offer Expiration: ${o.candidateName || 'Candidate'}`,
    date: o.validUntil || o.createdAt,
    time: '17:00',
    type: 'offer_deadline',
    status: o.status,
    candidateName: o.candidateName || 'Candidate',
    jobTitle: o.jobTitle || 'Role',
  }));

  const allEvents = [...interviewEvents, ...offerEvents];

  return sendResponse(res, 200, true, 'Company calendar events retrieved successfully', {
    events: allEvents,
  });
});
