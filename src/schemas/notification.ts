import { z } from 'zod';

export const notificationSchema = z.object({
  message: z.string().min(1, "Notification message cannot be empty."),
});
