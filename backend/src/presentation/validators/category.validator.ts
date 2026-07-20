import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().optional(),
    imageUrl: z.string().trim().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required").optional(),
    description: z.string().trim().optional(),
    imageUrl: z.string().trim().optional(),
  }),
});
