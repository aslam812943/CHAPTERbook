import { z } from "zod";

export const listReviewsSchema = z.object({
  query: z.object({
    bookId: z.string().min(1, "bookId is required"),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    bookId: z.string().min(1, "bookId is required"),
    rating: z.coerce.number().int().min(1, "Please select a rating").max(5),
    title: z.string().trim().min(1, "Review title is required").max(120),
    body: z.string().trim().min(1, "Review body is required").max(2000),
  }),
});
