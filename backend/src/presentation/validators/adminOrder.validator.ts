import { z } from "zod";

export const listOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
  }),
});
