import { z } from 'zod';

export const teamCategorySchema = z.object({
  name: z.string().min(1, "Name is required."),
  subDomain: z.string().min(1, "Subdomain is required."),
  order: z.number().int("Order must be an integer."),
});

export const teamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  role: z.string().min(1, "Role is required."),
  categoryId: z.string().min(1, "Category is required."),
});

export const teamMemberUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.string().min(1, "Role is required."),
  categoryId: z.string().min(1, "Category is required."),
  linkedin: z.string().url("Please enter a valid LinkedIn URL.").optional().or(z.literal("")),
  status: z.enum(['active', 'pending', 'alumni']),
  image: z.any().optional(),
});

export const completeOnboardingSchema = z.object({
  token: z.string(),
  linkedin: z.string().url("Please enter a valid LinkedIn URL.").optional().or(z.literal("")),
  image: z.any().optional(),
});
