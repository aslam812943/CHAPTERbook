import { z } from "zod";

export const createBookSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required"),
    authors: z.array(z.string().trim().min(1)).default([]),
    description: z.string().trim().default(""),
    isbn10: z.string().trim().optional(),
    isbn13: z.string().trim().optional(),
    publisher: z.string().trim().optional(),
    publishedDate: z.string().trim().optional(),
    pageCount: z.coerce.number().int().nonnegative().optional(),
    coverImageUrl: z.string().trim().url().optional().or(z.literal("")),
    price: z.coerce.number().nonnegative("Price must be zero or greater"),
    discountPercentage: z.coerce.number().min(0).max(100).default(0),
    stock: z.coerce.number().int().nonnegative().default(0),
    categoryIds: z.array(z.string()).default([]),
    language: z.string().trim().min(1).default("English"),
    source: z.enum(["google", "openlibrary", "manual"]).default("manual"),
    sourceId: z.string().trim().optional(),
  }),
});

export const updateBookSchema = z.object({
  body: createBookSchema.shape.body.partial(),
});

export const listBooksSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    categoryId: z.string().trim().optional(),
    language: z.string().trim().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});

export const adjustStockSchema = z.object({
  body: z.object({
    stock: z.coerce.number().int().nonnegative(),
  }),
});
