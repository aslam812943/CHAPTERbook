import { z } from "zod";

export const addWishlistItemSchema = z.object({
  body: z.object({
    bookId: z.string().min(1, "bookId is required"),
  }),
});
