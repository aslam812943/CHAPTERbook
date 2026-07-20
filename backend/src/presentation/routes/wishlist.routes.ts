import { Router } from "express";
import { WishlistController } from "../controllers/WishlistController";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { addWishlistItemSchema } from "../validators/wishlist.validator";

export function buildWishlistRouter(controller: WishlistController): Router {
  const router = Router();

  router.use(authenticate);

  router.get("/", asyncHandler(controller.getWishlist));
  router.post("/items", validate(addWishlistItemSchema), asyncHandler(controller.addItem));
  router.delete("/items/:bookId", asyncHandler(controller.removeItem));

  return router;
}
