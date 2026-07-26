import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import {
  changePasswordRateLimiter,
  loginRateLimiter,
  passwordResetRateLimiter,
  registerRateLimiter,
} from "../middlewares/rateLimit";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import {
  addressSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  googleAuthSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  removeAddressSchema,
  resetPasswordSchema,
  verifyResetCodeSchema,
} from "../validators/auth.validator";

export function buildAuthRouter(controller: AuthController): Router {
  const router = Router();

  router.post("/register", registerRateLimiter, validate(registerSchema), asyncHandler(controller.register));
  router.post("/login", loginRateLimiter, validate(loginSchema), asyncHandler(controller.login));
  router.post("/google", validate(googleAuthSchema), asyncHandler(controller.googleLogin));
  router.post("/refresh", validate(refreshSchema), asyncHandler(controller.refresh));
  router.get("/me", authenticate, asyncHandler(controller.me));
  router.post("/me/addresses", authenticate, validate(addressSchema), asyncHandler(controller.addAddress));
  router.delete(
    "/me/addresses/:index",
    authenticate,
    validate(removeAddressSchema),
    asyncHandler(controller.removeAddress)
  );
  router.patch(
    "/me/addresses/:index/default",
    authenticate,
    validate(removeAddressSchema),
    asyncHandler(controller.setDefaultAddress)
  );
  router.post(
    "/me/password",
    authenticate,
    changePasswordRateLimiter,
    validate(changePasswordSchema),
    asyncHandler(controller.changePassword)
  );

  router.post(
    "/forgot-password",
    passwordResetRateLimiter,
    validate(forgotPasswordSchema),
    asyncHandler(controller.forgotPassword)
  );
  router.post(
    "/verify-reset-code",
    passwordResetRateLimiter,
    validate(verifyResetCodeSchema),
    asyncHandler(controller.verifyResetCode)
  );
  router.post(
    "/reset-password",
    passwordResetRateLimiter,
    validate(resetPasswordSchema),
    asyncHandler(controller.resetPassword)
  );

  return router;
}
