import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import { authenticate, requireAdmin } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { publicCache } from "../middlewares/publicCache";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validator";

export function buildCategoryRouter(controller: CategoryController): Router {
  const router = Router();

  router.get("/", publicCache(300), asyncHandler(controller.list));
  router.post(
    "/",
    authenticate,
    requireAdmin,
    validate(createCategorySchema),
    asyncHandler(controller.create)
  );
  router.patch(
    "/:id",
    authenticate,
    requireAdmin,
    validate(updateCategorySchema),
    asyncHandler(controller.update)
  );
  router.delete("/:id", authenticate, requireAdmin, asyncHandler(controller.delete));

  return router;
}
