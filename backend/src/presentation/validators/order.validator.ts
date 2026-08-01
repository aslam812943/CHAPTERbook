import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    address: z.object({
      fullName: z.string().trim().min(1, "Full name is required").max(100),
      phone: z.string().trim().min(1, "Phone is required").max(20),
      addressLine: z.string().trim().min(1, "Address is required").max(200),
      city: z.string().trim().min(1, "City is required").max(100),
      postalCode: z.string().trim().max(20).optional(),
      country: z.string().trim().min(1, "Country is required").max(100),
    }),
  }),
});

export const estimateDeliverySchema = z.object({
  body: z.object({
    addressLine: z.string().trim().min(1, "Address is required").max(200),
    city: z.string().trim().min(1, "City is required").max(100),
    postalCode: z.string().trim().max(20).optional(),
    country: z.string().trim().min(1, "Country is required").max(100),
  }),
});
