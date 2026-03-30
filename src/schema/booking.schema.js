import { z } from 'zod';

export const bookingCreateSchema = z.object({
  serviceType: z.enum(['plough', 'harrow', 'ridge', 'full'], {
    errorMap: () => ({ message: "Service type must be one of: plough, harrow, ridge, full" })
  }),
  landSize: z.number().positive("Land size must be a positive number"),
  location: z.string().min(3, "Location must be at least 3 characters long")
});

export const pricePreviewSchema = bookingCreateSchema;
