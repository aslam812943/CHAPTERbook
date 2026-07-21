import { Router } from "express";
import { BookRequestController } from "../controllers/BookRequestController";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { createBookRequestSchema } from "../validators/bookRequest.validator";

export function buildBookRequestRouter(controller: BookRequestController): Router {
  const router = Router();

  router.post("/", authenticate, validate(createBookRequestSchema), asyncHandler(controller.create));
  router.get("/mine", authenticate, asyncHandler(controller.listMine));
  router.get("/unseen", authenticate, asyncHandler(controller.unseen));
  router.post("/mine/seen", authenticate, asyncHandler(controller.markSeen));

  return router;
}
