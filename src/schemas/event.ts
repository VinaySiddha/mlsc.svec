import { z } from 'zod';

export const EVENT_CATEGORIES = ['Workshop', 'Bootcamp', 'Hackathon', 'Community', 'Talk', 'Other'] as const;

export const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().optional(),
  category: z.enum(EVENT_CATEGORIES).default('Workshop'),
  date: z.date({ required_error: "An event date is required." }),
  time: z.string().min(1, "Event time is required."),
  venue: z.string().min(1, "Event venue is required."),
  registrationOpen: z.boolean().default(true),
  registrationDeadline: z.date().optional(),
  registrationLimit: z.number().int().nonnegative().default(0),
  registrationFee: z.coerce.number().nonnegative().default(0),
  feedbackLink: z.string().url("A valid URL is required for the feedback link.").optional().or(z.literal("")),
  eventLink: z.string().url("A valid URL is required for the event link.").optional().or(z.literal("")),
  bannerImage: z.any().optional(),
  listImage: z.any().optional(),
  highlightImages: z.any().optional(),
  speakers: z.any().optional(),
  timeline: z.any().optional(),
});

export const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(1, 'Phone number is required.'),
  rollNo: z.string().min(1, 'Roll number is required.'),
  branch: z.string().min(1, 'Branch is required.'),
  yearOfStudy: z.string().min(1, 'Year of study is required.'),
});
