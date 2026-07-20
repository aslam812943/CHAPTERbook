import { z } from "zod";

export const addCartItemSchema = z.object({
  body: z.object({
    bookId: z.string().min(1, "bookId is required"),
    quantity: z.coerce.number().int().min(1).default(1),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.coerce.number().int().min(0),
  }),
});
