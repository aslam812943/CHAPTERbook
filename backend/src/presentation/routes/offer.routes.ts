import { Router } from "express";
import { OfferController } from "../controllers/OfferController";
import { authenticate, requireAdmin } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { createOfferSchema, updateOfferSchema } from "../validators/offer.validator";

export function buildOfferRouter(controller: OfferController): Router {
  const router = Router();

  // Public - used by the homepage highlight section and the shop page's
  // offer filter, both of which should only ever see currently-active offers.
  router.get("/active", asyncHandler(controller.listActive));

  // Admin-only from here - the full list (including inactive offers) is
  // only useful for managing them.
  router.get("/", authenticate, requireAdmin, asyncHandler(controller.listAll));
  router.post("/", authenticate, requireAdmin, validate(createOfferSchema), asyncHandler(controller.create));
  router.patch("/:id", authenticate, requireAdmin, validate(updateOfferSchema), asyncHandler(controller.update));
  router.delete("/:id", authenticate, requireAdmin, asyncHandler(controller.delete));

  return router;
}
