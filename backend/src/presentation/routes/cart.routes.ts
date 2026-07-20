import { Router } from "express";
import { CartController } from "../controllers/CartController";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { addCartItemSchema, updateCartItemSchema } from "../validators/cart.validator";

export function buildCartRouter(controller: CartController): Router {
  const router = Router();

  router.use(authenticate);

  router.get("/", asyncHandler(controller.getCart));
  router.post("/items", validate(addCartItemSchema), asyncHandler(controller.addItem));
  router.patch("/items/:bookId", validate(updateCartItemSchema), asyncHandler(controller.updateItem));
  router.delete("/items/:bookId", asyncHandler(controller.removeItem));
  router.delete("/", asyncHandler(controller.clear));

  return router;
}
