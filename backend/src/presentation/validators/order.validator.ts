import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    address: z.object({
      fullName: z.string().trim().min(1, "Full name is required"),
      phone: z.string().trim().min(1, "Phone is required"),
      addressLine: z.string().trim().min(1, "Address is required"),
      city: z.string().trim().min(1, "City is required"),
      postalCode: z.string().trim().optional(),
      country: z.string().trim().min(1, "Country is required"),
    }),
  }),
});
