import { Router } from "express";
import { AdminBookRequestController } from "../controllers/AdminBookRequestController";
import { authenticate, requireAdmin } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { listBookRequestsSchema, updateBookRequestStatusSchema } from "../validators/bookRequest.validator";

export function buildAdminBookRequestRouter(controller: AdminBookRequestController): Router {
  const router = Router();

  router.get(
    "/book-requests",
    authenticate,
    requireAdmin,
    validate(listBookRequestsSchema),
    asyncHandler(controller.list)
  );
  router.patch(
    "/book-requests/:id/status",
    authenticate,
    requireAdmin,
    validate(updateBookRequestStatusSchema),
    asyncHandler(controller.updateStatus)
  );

  return router;
}
