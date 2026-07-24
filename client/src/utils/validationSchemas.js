import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const candidateRegisterSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

export const companyRegisterSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name must be at least 2 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  website: z.string().url('Invalid URL address').optional().or(z.literal('')),
  industry: z.string().optional(),
});

export const jobPostingSchema = z.object({
  title: z.string().trim().min(3, 'Job title must be at least 3 characters'),
  department: z.string().optional(),
  description: z.string().trim().min(20, 'Description must be at least 20 characters'),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
  employmentType: z.string().min(1, 'Employment type is required'),
  workMode: z.string().min(1, 'Work mode is required'),
});
