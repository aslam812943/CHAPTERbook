import { z } from "zod";

export const createAuthorSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),
    imageUrl: z.string().trim().optional(),
  }),
});

export const updateAuthorSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required").optional(),
    imageUrl: z.string().trim().optional(),
  }),
});
