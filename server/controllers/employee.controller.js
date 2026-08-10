import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendResponse } from '../utils/sendResponse.js';
import { Employee } from '../models/employee.model.js';
import { Application } from '../models/application.model.js';
import { Candidate } from '../models/candidate.model.js';
import { Company } from '../models/company.model.js';
import { Job } from '../models/job.model.js';
import { OfferLetter } from '../models/offerLetter.model.js';
import { InterviewRoom } from '../models/interviewRoom.model.js';

/**
 * Auto-Onboard Candidate from ATS Profile & Resume Builder data into HRMS Employee Record
 * POST /api/v1/company/employees/onboard
 */
export const autoOnboardCandidateHandler = asyncHandler(async (req, res, _next) => {
  const companyId = req.user.companyId || req.user._id;
  const {
    applicationId,
    candidateId: rawCandidateId,
    salary,
    currency,
    department,
    designation,
    reportingManager,
    shift,
    officeLocation,
    employmentType,
    probationPeriod,
    joiningDate,
  } = req.body;

  let application = null;
  if (applicationId) {
    application = await Application.findById(applicationId)
      .populate('candidateId')
      .populate('jobId')
      .populate('companyId');
  }

  const candidateId = application?.candidateId?._id || rawCandidateId;

  if (!candidateId) {
    throw new AppError('Candidate ID or Application ID is required for onboarding.', 400);
  }

  // 1. Duplicate Onboarding Prevention Check
  let existingEmployee = await Employee.findOne({
    companyId,
    $or: [{ candidateId }, { applicationId: application?._id }],
  });

  if (existingEmployee) {
    return sendResponse(res, 200, true, 'Employee profile already onboarded from ATS', {
      employee: existingEmployee,
      isExisting: true,
    });
  }

  // 2. Fetch Full Candidate ATS & Resume Builder Profile
  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    throw new AppError('Candidate record not found in ATS system.', 404);
  }

  const company = await Company.findById(companyId);
  const job = application?.jobId ? await Job.findById(application.jobId) : null;

  // 3. Find Matching Audit Entities (Offer Letter & Interview Room)
  const [offerDoc, roomDoc] = await Promise.all([
    OfferLetter.findOne({ companyId, candidateId }).sort({ createdAt: -1 }),
    InterviewRoom.findOne({ companyId, candidateId }).sort({ createdAt: -1 }),
  ]);

  // 4. Generate Auto HRMS Identifiers
  const randomIdNumber = Math.floor(100000 + Math.random() * 900000);
  const employeeId = `EMP-${new Date().getFullYear()}-${randomIdNumber}`;

  const cleanName = (candidate.fullName || 'employee').toLowerCase().replace(/[^a-z0-9]/g, '.');
  const compNameSlug = (company?.companyName || 'company').toLowerCase().replace(/[^a-z0-9]/g, '');
  const companyEmailPlaceholder = `${cleanName}@${compNameSlug}.com`;

  // 5. Auto Import All Resume & Candidate Profile Data
  const importedData = {
    employeeId,
    companyEmailPlaceholder,
    companyId,
    candidateId: candidate._id,
    applicationId: application?._id || candidate._id,
    jobId: job?._id || application?.jobId || companyId,
    interviewId: roomDoc?._id || null,
    offerId: offerDoc?._id || null,
    joiningDate: joiningDate ? new Date(joiningDate) : offerDoc?.joiningDate || new Date(Date.now() + 14 * 86400000),
    employeeStatus: 'Onboarding',
    hrmsProfileStatus: 'Imported from ATS',

    // ATS Resume Imported Fields
    fullName: candidate.fullName || 'Candidate Name',
    email: candidate.email,
    phone: candidate.phone || application?.candidateSnapshot?.phone || '',
    address: candidate.location || application?.candidateSnapshot?.location || 'Remote',
    professionalSummary: candidate.bio || candidate.headline || 'Software Engineering Professional',
    skills: candidate.skills && candidate.skills.length > 0 ? candidate.skills : (application?.candidateSnapshot?.skills || []),
    experience: candidate.experience || [],
    education: candidate.education || [],
    projects: candidate.projects || [],
    certifications: candidate.certifications || [],
    languages: ['English'],
    socialLinks: {
      portfolio: candidate.socialLinks?.portfolio || '',
      github: candidate.socialLinks?.github || '',
      linkedin: candidate.socialLinks?.linkedin || '',
      twitter: candidate.socialLinks?.twitter || '',
    },
    resumeUrl: candidate.resumeUrl || application?.resumeUrl || '',
    atsImportedFields: [
      'fullName',
      'email',
      'phone',
      'address',
      'professionalSummary',
      'skills',
      'experience',
      'education',
      'projects',
      'certifications',
      'languages',
      'portfolio',
      'github',
      'linkedin',
      'resumeUrl',
    ],

    // HR Editable Fields with Smart Fallbacks
    salary: Number(salary || offerDoc?.salary || job?.salaryRange?.max || 120000),
    currency: currency || offerDoc?.currency || 'USD',
    department: department || job?.department || 'Engineering',
    designation: designation || offerDoc?.designation || job?.title || 'Software Engineer',
    reportingManager: reportingManager || 'Engineering Director',
    shift: shift || 'General Shift (9 AM - 6 PM)',
    officeLocation: officeLocation || job?.location || company?.location || 'Headquarters',
    employmentType: employmentType || job?.employmentType || 'Full-Time',
    probationPeriod: probationPeriod || '90 Days',
  };

  const employee = await Employee.create(importedData);

  // 6. Automatically Move Application Stage to Selected / Hired
  if (application) {
    application.status = 'Selected';
    application.lastUpdated = new Date();
    application.timeline = application.timeline || [];
    application.timeline.push({
      status: 'Hired & Onboarded',
      date: new Date(),
      note: `Auto-onboarded to HRMS Employee profile (ID: ${employee.employeeId})`,
      updatedBy: 'HRMS Automated Pipeline',
    });
    await application.save();
  }

  return sendResponse(res, 201, true, 'Candidate auto-onboarded to HRMS Employee profile successfully', {
    employee,
    isExisting: false,
  });
});

/**
 * Get Onboarded Employees for Company
 * GET /api/v1/company/employees
 */
export const getCompanyEmployeesHandler = asyncHandler(async (req, res, _next) => {
  const companyId = req.user.companyId || req.user._id;
  const employees = await Employee.find({ companyId })
    .populate('candidateId', 'fullName email phone avatarUrl resumeUrl')
    .populate('jobId', 'title department')
    .sort({ createdAt: -1 })
    .lean();

  return sendResponse(res, 200, true, 'Company HRMS employees retrieved successfully', { employees });
});

/**
 * Get Single Employee HRMS Profile by ID with Candidate Audit Mapping
 * GET /api/v1/company/employees/:id
 */
export const getEmployeeByIdHandler = asyncHandler(async (req, res, _next) => {
  const employee = await Employee.findById(req.params.id)
    .populate('candidateId', 'fullName email phone headline bio avatarUrl resumeUrl socialLinks')
    .populate('jobId', 'title department employmentType location')
    .populate('offerId', 'salary designation joiningDate validUntil status')
    .populate('interviewId', 'roomId status evaluationScores recruiterNotes')
    .lean();

  if (!employee) {
    throw new AppError('Employee profile record not found.', 404);
  }

  return sendResponse(res, 200, true, 'Employee profile details retrieved', { employee });
});

/**
 * Update HR Editable Fields Only (Strict Field Protection)
 * PATCH /api/v1/company/employees/:id
 */
export const updateEmployeeHRFieldsHandler = asyncHandler(async (req, res, _next) => {
  const { id } = req.params;
  const {
    salary,
    currency,
    department,
    designation,
    reportingManager,
    shift,
    officeLocation,
    employmentType,
    probationPeriod,
    employeeStatus,
    joiningDate,
  } = req.body;

  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError('Employee profile not found.', 404);
  }

  // Update ONLY permitted HR fields
  if (salary !== undefined) employee.salary = Number(salary);
  if (currency !== undefined) employee.currency = currency;
  if (department !== undefined) employee.department = department;
  if (designation !== undefined) employee.designation = designation;
  if (reportingManager !== undefined) employee.reportingManager = reportingManager;
  if (shift !== undefined) employee.shift = shift;
  if (officeLocation !== undefined) employee.officeLocation = officeLocation;
  if (employmentType !== undefined) employee.employmentType = employmentType;
  if (probationPeriod !== undefined) employee.probationPeriod = probationPeriod;
  if (employeeStatus !== undefined) employee.employeeStatus = employeeStatus;
  if (joiningDate !== undefined) employee.joiningDate = new Date(joiningDate);

  await employee.save();

  return sendResponse(res, 200, true, 'HR fields updated successfully', { employee });
});
