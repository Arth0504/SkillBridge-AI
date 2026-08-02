import { sendEmail } from '../utils/sendEmail.js';
import { logger } from '../utils/logger.js';

const EMAIL_WRAPPER = (title, contentHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; tracking-tight; }
    .header p { color: #e0e7ff; margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 24px; font-size: 14px; line-height: 1.6; color: #cbd5e1; }
    .btn { display: inline-block; background: #6366f1; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 12px; margin: 20px 0; font-size: 14px; text-align: center; }
    .footer { background: #0f172a; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #334155; }
    .card { background: #0f172a; border-radius: 12px; border: 1px solid #334155; padding: 16px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SkillBridge AI</h1>
      <p>Autonomous AI Hiring Platform</p>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SkillBridge AI Inc. All rights reserved.</p>
      <p>Automated Enterprise Notification • Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendWelcomeEmail = async (email, name) => {
  const content = `
    <h2>Welcome to SkillBridge AI, ${name}! 🎉</h2>
    <p>Your candidate account has been successfully verified. You now have full access to:</p>
    <ul>
      <li>AI Resume Match Analysis</li>
      <li>Adaptive Gemini AI Mock Interviews</li>
      <li>Technical Coding Assessments</li>
      <li>Direct Job Applications to Top Companies</li>
    </ul>
    <a href="http://localhost:5173/candidate/dashboard" class="btn">Explore Candidate Portal</a>
  `;
  return sendEmail({
    to: email,
    subject: 'Welcome to SkillBridge AI - Account Activated',
    html: EMAIL_WRAPPER('Welcome to SkillBridge AI', content),
    text: `Welcome to SkillBridge AI, ${name}!`,
  });
};

export const sendCompanyVerificationEmail = async (email, companyName, token) => {
  const verifyLink = `http://localhost:5173/verify-company?token=${token}`;
  const content = `
    <h2>Company Account Verification</h2>
    <p>Thank you for registering <strong>${companyName}</strong> on SkillBridge AI.</p>
    <p>Please verify your corporate recruiter account by clicking the button below:</p>
    <a href="${verifyLink}" class="btn">Verify Company Account</a>
  `;
  return sendEmail({
    to: email,
    subject: `Verify Corporate Account - ${companyName}`,
    html: EMAIL_WRAPPER('Verify Company Account', content),
    text: `Verify company account: ${verifyLink}`,
  });
};

export const sendApplicationConfirmationEmail = async (email, candidateName, jobTitle, companyName) => {
  const content = `
    <h2>Application Received! 📝</h2>
    <p>Hi ${candidateName},</p>
    <p>Your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been submitted successfully.</p>
    <div class="card">
      <p style="margin: 0; font-weight: bold; color: #818cf8;">Next Steps:</p>
      <p style="margin: 4px 0 0 0;">Our AI screening system and hiring team will review your application profile and invite you for an AI technical evaluation.</p>
    </div>
  `;
  return sendEmail({
    to: email,
    subject: `Application Confirmation: ${jobTitle} at ${companyName}`,
    html: EMAIL_WRAPPER('Application Received', content),
    text: `Your application for ${jobTitle} at ${companyName} was submitted successfully.`,
  });
};

export const sendShortlistedEmail = async (email, candidateName, jobTitle, companyName) => {
  const content = `
    <h2>Congratulations! You are Shortlisted 🌟</h2>
    <p>Hi ${candidateName},</p>
    <p>Great news! <strong>${companyName}</strong> has reviewed your profile and shortlisted your application for <strong>${jobTitle}</strong>.</p>
    <a href="http://localhost:5173/candidate/interviews" class="btn">View Interview Portal</a>
  `;
  return sendEmail({
    to: email,
    subject: `Application Shortlisted: ${jobTitle} at ${companyName}`,
    html: EMAIL_WRAPPER('You are Shortlisted', content),
    text: `You have been shortlisted for ${jobTitle} at ${companyName}!`,
  });
};

export const sendInterviewInvitationEmail = async (candidateInput, detailsOrName, jobTitleParam, dateStrParam, timeStrParam) => {
  let email, candidateName, jobTitle, companyName, dateStr, timeStr, roomUrl, durationMinutes, interviewType;

  if (typeof candidateInput === 'object' && candidateInput !== null) {
    email = candidateInput.email;
    candidateName = candidateInput.fullName || candidateInput.name || 'Candidate';
    const details = detailsOrName || {};
    jobTitle = details.jobTitle || 'Position';
    companyName = details.companyName || '';
    const schedDate = details.scheduledDate ? new Date(details.scheduledDate) : null;
    dateStr = schedDate ? schedDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD';
    timeStr = schedDate ? schedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD';
    roomUrl = details.roomUrl || 'http://localhost:5173/candidate/interviews';
    durationMinutes = details.durationMinutes || 45;
    interviewType = details.interviewType || 'Technical';
  } else {
    email = candidateInput;
    candidateName = detailsOrName || 'Candidate';
    jobTitle = jobTitleParam || 'Position';
    dateStr = dateStrParam || 'TBD';
    timeStr = timeStrParam || 'TBD';
    roomUrl = 'http://localhost:5173/candidate/interviews';
  }

  const content = `
    <h2>Interview Scheduled 📅</h2>
    <p>Hi ${candidateName},</p>
    <p>An interview session has been scheduled for your application for <strong>${jobTitle}</strong>${companyName ? ` at <strong>${companyName}</strong>` : ''}.</p>
    <div class="card">
      <p style="margin: 0;"><strong>Date:</strong> ${dateStr}</p>
      <p style="margin: 4px 0 0 0;"><strong>Time:</strong> ${timeStr}</p>
      ${durationMinutes ? `<p style="margin: 4px 0 0 0;"><strong>Duration:</strong> ${durationMinutes} mins</p>` : ''}
      ${interviewType ? `<p style="margin: 4px 0 0 0;"><strong>Interview Type:</strong> ${interviewType}</p>` : ''}
    </div>
    <a href="${roomUrl}" class="btn">Join Interview Room</a>
  `;
  return sendEmail({
    to: email,
    subject: `Interview Invitation: ${jobTitle}${companyName ? ` at ${companyName}` : ''}`,
    html: EMAIL_WRAPPER('Interview Scheduled', content),
    text: `Your ${interviewType || 'interview'} for ${jobTitle} is scheduled on ${dateStr} at ${timeStr}. Join: ${roomUrl}`,
  });
};

export const sendInterviewReminderEmail = async (email, candidateName, jobTitle, hoursRemaining) => {
  const content = `
    <h2>Interview Reminder (${hoursRemaining} Hour${hoursRemaining > 1 ? 's' : ''} Remaining) ⏰</h2>
    <p>Hi ${candidateName},</p>
    <p>This is a reminder that your interview for <strong>${jobTitle}</strong> takes place in ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}.</p>
    <p>Please make sure your webcam, microphone, and resume are prepared.</p>
    <a href="http://localhost:5173/candidate/interviews" class="btn">Prepare Hardware & Enter</a>
  `;
  return sendEmail({
    to: email,
    subject: `Reminder: Interview in ${hoursRemaining} Hour${hoursRemaining > 1 ? 's' : ''} - ${jobTitle}`,
    html: EMAIL_WRAPPER('Interview Reminder', content),
    text: `Reminder: Your interview for ${jobTitle} is in ${hoursRemaining} hour(s).`,
  });
};

export const sendOfferEmail = async (email, candidateName, jobTitle, companyName) => {
  const content = `
    <h2>Job Offer Congratulations! 🎉🏆</h2>
    <p>Dear ${candidateName},</p>
    <p>We are thrilled to inform you that <strong>${companyName}</strong> has selected you for the role of <strong>${jobTitle}</strong>!</p>
    <p>Your strong performance across the resume match, AI technical interview, and coding assessment earned an exceptional recommendation.</p>
    <a href="http://localhost:5173/candidate/applications" class="btn">View Offer Details</a>
  `;
  return sendEmail({
    to: email,
    subject: `Job Offer: ${jobTitle} at ${companyName}`,
    html: EMAIL_WRAPPER('Congratulations on your Offer!', content),
    text: `Congratulations! ${companyName} has extended an offer for ${jobTitle}.`,
  });
};

export const sendRejectionEmail = async (email, candidateName, jobTitle, companyName) => {
  const content = `
    <h2>Application Status Update</h2>
    <p>Dear ${candidateName},</p>
    <p>Thank you for giving us the opportunity to consider your profile for the <strong>${jobTitle}</strong> role at <strong>${companyName}</strong>.</p>
    <p>While your qualifications are impressive, we have decided to move forward with candidates whose experience aligns more closely with our immediate requirements.</p>
    <p>We wish you every success in your job search!</p>
  `;
  return sendEmail({
    to: email,
    subject: `Update on your application for ${jobTitle}`,
    html: EMAIL_WRAPPER('Application Status Update', content),
    text: `Update on your application for ${jobTitle} at ${companyName}.`,
  });
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
  const content = `
    <h2>Password Reset Request 🔑</h2>
    <p>We received a request to reset your password for your SkillBridge AI account.</p>
    <p>Click the button below to set a new password. This link is valid for 1 hour.</p>
    <a href="${resetLink}" class="btn">Reset Password</a>
  `;
  return sendEmail({
    to: email,
    subject: 'SkillBridge AI - Password Reset Request',
    html: EMAIL_WRAPPER('Password Reset Request', content),
    text: `Reset your password using this link: ${resetLink}`,
  });
};

export const sendInterviewCompletedEmail = async (email, candidateName, jobTitle) => {
  const content = `
    <h2>Interview Completed 🏁</h2>
    <p>Hi ${candidateName},</p>
    <p>Your interview for the <strong>${jobTitle}</strong> position has concluded.</p>
    <p>The recruitment team is evaluating your response and feedback. You will receive an update shortly.</p>
  `;
  return sendEmail({
    to: email,
    subject: `Interview Completed: ${jobTitle}`,
    html: EMAIL_WRAPPER('Interview Completed', content),
    text: `Your interview for ${jobTitle} has completed.`,
  });
};

export const sendJoiningReminderEmail = async (email, candidateName, jobTitle, companyName, joiningDateStr) => {
  const content = `
    <h2>Joining Reminder 🚀</h2>
    <p>Hi ${candidateName},</p>
    <p>This is a reminder that your official start date at <strong>${companyName}</strong> for <strong>${jobTitle}</strong> is <strong>${joiningDateStr}</strong>!</p>
    <p>We are excited to welcome you to the team.</p>
  `;
  return sendEmail({
    to: email,
    subject: `Joining Reminder: ${jobTitle} at ${companyName}`,
    html: EMAIL_WRAPPER('Joining Reminder', content),
    text: `Reminder: Your joining date at ${companyName} for ${jobTitle} is ${joiningDateStr}.`,
  });
};

export const sendOfferLetterPdfEmail = async (email, candidateName, jobTitle, companyName, offerUrl) => {
  const content = `
    <h2>Official Job Offer Letter 🏆</h2>
    <p>Dear ${candidateName},</p>
    <p>Congratulations! <strong>${companyName}</strong> has generated your official offer letter for <strong>${jobTitle}</strong>.</p>
    <a href="${offerUrl}" class="btn">View & Download Offer Letter PDF</a>
  `;
  return sendEmail({
    to: email,
    subject: `Official Offer Letter: ${jobTitle} at ${companyName}`,
    html: EMAIL_WRAPPER('Official Job Offer', content),
    text: `Your official offer letter for ${jobTitle} at ${companyName} is ready: ${offerUrl}`,
  });
};

export const emailAutomationService = {
  sendWelcomeEmail,
  sendCompanyVerificationEmail,
  sendApplicationConfirmationEmail,
  sendShortlistedEmail,
  sendInterviewInvitationEmail,
  sendInterviewReminderEmail,
  sendInterviewCompletedEmail,
  sendJoiningReminderEmail,
  sendOfferEmail,
  sendOfferLetterPdfEmail,
  sendRejectionEmail,
  sendPasswordResetEmail,
};

export default emailAutomationService;
