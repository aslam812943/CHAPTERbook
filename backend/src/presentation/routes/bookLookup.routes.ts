import { Router } from "express";
import { BookLookupController } from "../controllers/BookLookupController";
import { authenticate, requireAdmin } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { bookSearchRateLimiter } from "../middlewares/rateLimit";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { bookLookupSchema } from "../validators/bookLookup.validator";

export function buildBookLookupRouter(controller: BookLookupController): Router {
  const router = Router();

  router.get(
    "/books/search",
    authenticate,
    requireAdmin,
    bookSearchRateLimiter,
    validate(bookLookupSchema),
    asyncHandler(controller.search)
  );

  return router;
}
