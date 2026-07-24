import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

export const sendEmail = async ({ to, subject, html, text }) => {
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT) || 587,
      secure: env.SMTP_SECURE === 'true',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${env.EMAIL_FROM_NAME || 'SkillBridge AI'}" <${env.EMAIL_FROM_ADDRESS || 'noreply@skillbridge.ai'}>`,
      to,
      subject,
      text,
      html,
    });

    logger.info(`📧 Email sent successfully to ${to}`);
  } else {
    // Development fallback if SMTP settings are not provided in .env
    logger.info(`📧 [DEV EMAIL SIMULATOR] To: ${to} | Subject: ${subject}`);
    logger.info(`📧 [EMAIL BODY]: ${text || html}`);
  }
};
