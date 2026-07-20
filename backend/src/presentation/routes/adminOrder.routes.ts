import { Router } from "express";
import { AdminOrderController } from "../controllers/AdminOrderController";
import { authenticate, requireAdmin } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { listOrdersSchema, updateOrderStatusSchema } from "../validators/adminOrder.validator";

export function buildAdminOrderRouter(controller: AdminOrderController): Router {
  const router = Router();

  router.get(
    "/orders",
    authenticate,
    requireAdmin,
    validate(listOrdersSchema),
    asyncHandler(controller.list)
  );
  router.patch(
    "/orders/:id/status",
    authenticate,
    requireAdmin,
    validate(updateOrderStatusSchema),
    asyncHandler(controller.updateStatus)
  );

  return router;
}
