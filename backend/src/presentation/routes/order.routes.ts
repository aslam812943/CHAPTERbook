import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { deliveryEstimateRateLimiter } from "../middlewares/rateLimit";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { createOrderSchema, estimateDeliverySchema } from "../validators/order.validator";

export function buildOrderRouter(controller: OrderController): Router {
  const router = Router();

  router.use(authenticate);

  router.post("/", validate(createOrderSchema), asyncHandler(controller.createOrder));
  router.post(
    "/estimate-delivery",
    deliveryEstimateRateLimiter,
    validate(estimateDeliverySchema),
    asyncHandler(controller.estimateDelivery)
  );
  router.get("/me", asyncHandler(controller.listMyOrders));
  router.get("/:id", asyncHandler(controller.getById));

  return router;
}
