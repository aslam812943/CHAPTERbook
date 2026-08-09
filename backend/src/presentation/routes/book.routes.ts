import { Router } from "express";
import { BookController } from "../controllers/BookController";
import { authenticate, requireAdmin } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { publicCache } from "../middlewares/publicCache";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import {
  adjustStockSchema,
  createBookSchema,
  listBooksSchema,
  updateBookSchema,
} from "../validators/book.validator";

export function buildBookRouter(controller: BookController): Router {
  const router = Router();

  router.get("/", publicCache(300), validate(listBooksSchema), asyncHandler(controller.list));
  // Public book detail page looks up by slug (readable URL, SEO); the raw
  // ObjectId route below stays for admin (edit/stock/delete) and as a
  // legacy fallback for any /books/<id> link/bookmark from before slugs
  // existed - the frontend redirects those to the canonical slug URL.
  router.get("/slug/:slug", publicCache(300), asyncHandler(controller.getBySlug));
  router.get("/:id", publicCache(300), asyncHandler(controller.getById));

  router.post(
    "/",
    authenticate,
    requireAdmin,
    validate(createBookSchema),
    asyncHandler(controller.create)
  );
  router.patch(
    "/:id",
    authenticate,
    requireAdmin,
    validate(updateBookSchema),
    asyncHandler(controller.update)
  );
  router.patch(
    "/:id/stock",
    authenticate,
    requireAdmin,
    validate(adjustStockSchema),
    asyncHandler(controller.adjustStock)
  );
  router.delete("/:id", authenticate, requireAdmin, asyncHandler(controller.delete));

  return router;
}
