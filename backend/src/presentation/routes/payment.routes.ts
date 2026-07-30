import { Router } from "express";
import { PaymentController } from "../controllers/PaymentController";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { verifyPaymentSchema } from "../validators/payment.validator";

export function buildPaymentRouter(controller: PaymentController): Router {
  const router = Router();

  // Called server-to-server by Razorpay, not through a logged-in browser -
  // authenticated by its own HMAC signature (see PaymentService.handleWebhook),
  // not a session token, so it's mounted ahead of the authenticate() gate below.
  router.post("/webhook", asyncHandler(controller.webhook));

  router.use(authenticate);
  router.post("/orders/:orderId", asyncHandler(controller.createOrder));
  router.post("/verify", validate(verifyPaymentSchema), asyncHandler(controller.verifyPayment));

  return router;
}
