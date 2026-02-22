import { z } from 'zod';

// Application schema - copied from web app
export const applicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(1, 'Phone number is required.'),
  rollNo: z.string().min(1, 'Roll number is required.'),
  branch: z.string({ required_error: 'Please select your branch.' }),
  section: z.string({ required_error: 'Please select your section.' }),
  yearOfStudy: z.string({ required_error: 'Please select your year of study.' }),
  cgpa: z.string().min(1, 'CGPA is required.'),
  backlogs: z.string().min(1, 'Number of backlogs is required.'),
  joinReason: z.string().min(20, 'Please tell us why you want to join (minimum 20 characters).'),
  aboutClub: z.string().min(20, 'Please tell us what you know about the club (minimum 20 characters).'),
  technicalDomain: z.string({ required_error: 'Please select a technical domain.' }).min(1),
  nonTechnicalDomain: z.string({ required_error: 'Please select a non-technical domain.' }).min(1),
  linkedin: z.string().url('Please enter a valid LinkedIn URL.').optional().or(z.literal('')),
  anythingElse: z.string().optional(),
});

// Event registration schema
export const registrationSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  rollNo: z.string().min(1, 'Roll number is required.'),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
  branch: z.string({ required_error: 'Please select your branch.' }),
  yearOfStudy: z.string({ required_error: 'Please select your year of study.' }),
});

// Review schema (for admin)
export const reviewSchema = z.object({
  status: z.string(),
  isRecommended: z.boolean(),
  suitability: z.object({
    technical: z.string().optional(),
    nonTechnical: z.string().optional(),
  }),
  ratings: z.object({
    communication: z.number().min(0).max(5),
    technical: z.number().min(0).max(5),
    problemSolving: z.number().min(0).max(5),
    teamFit: z.number().min(0).max(5),
    overall: z.number().min(0).max(5),
  }),
  remarks: z.string().optional(),
});

// Constants
export const BRANCHES = ['AIML', 'CAI', 'CSE', 'CST', 'ECE', 'Others'];
export const SECTIONS = ['A', 'B', 'C', 'D', 'E'];
export const YEARS = ['2nd', '3rd'];

export const TECHNICAL_DOMAINS = [
  { id: 'gen_ai', label: 'Generative AI' },
  { id: 'ds_ml', label: 'Data Science & Machine Learning' },
  { id: 'azure', label: 'Azure Cloud' },
  { id: 'web_app', label: 'Web and APP Development' },
];

export const NON_TECHNICAL_DOMAINS = [
  { id: 'event_management', label: 'Event Management' },
  { id: 'public_relations', label: 'Public Relations' },
  { id: 'media_marketing', label: 'Media Marketing' },
  { id: 'creativity', label: 'Creativity' },
];

export const APPLICATION_STATUSES = [
  'Received',
  'Under Processing',
  'Interviewing',
  'Recommended',
  'Hired',
  'Rejected',
];
