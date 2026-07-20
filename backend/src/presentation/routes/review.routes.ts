import { Router } from "express";
import { ReviewController } from "../controllers/ReviewController";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { createReviewSchema, listReviewsSchema } from "../validators/review.validator";

export function buildReviewRouter(controller: ReviewController): Router {
  const router = Router();

  router.get("/", validate(listReviewsSchema), asyncHandler(controller.getSummary));
  router.post("/", authenticate, validate(createReviewSchema), asyncHandler(controller.create));

  return router;
}
