import { z } from "zod";

export const createOfferSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required").max(100, "Keep it under 100 characters"),
    scopeType: z.enum(["all", "category", "product"]),
    categoryId: z.string().trim().optional(),
    bookId: z.string().trim().optional(),
    discountPercentage: z.coerce.number().min(1, "Must be at least 1%").max(100, "Cannot exceed 100%"),
    isActive: z.coerce.boolean().optional(),
  }),
});

export const updateOfferSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required").max(100, "Keep it under 100 characters").optional(),
    scopeType: z.enum(["all", "category", "product"]).optional(),
    categoryId: z.string().trim().optional(),
    bookId: z.string().trim().optional(),
    discountPercentage: z.coerce.number().min(1, "Must be at least 1%").max(100, "Cannot exceed 100%").optional(),
    isActive: z.coerce.boolean().optional(),
  }),
});
