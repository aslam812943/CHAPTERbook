import { z } from "zod";

export const createBookRequestSchema = z.object({
  body: z.object({
    bookTitle: z.string().trim().min(1, "Book title is required").max(200),
    authorName: z.string().trim().max(200).optional(),
    note: z.string().trim().max(500).optional(),
  }),
});

export const listBookRequestsSchema = z.object({
  query: z.object({
    status: z.enum(["pending", "fulfilled", "rejected"]).optional(),
  }),
});

export const updateBookRequestStatusSchema = z.object({
  body: z.object({
    status: z.enum(["fulfilled", "rejected"]),
    adminNote: z.string().trim().max(500).optional(),
    bookId: z.string().trim().min(1).optional(),
  }),
});
