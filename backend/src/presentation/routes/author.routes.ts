import { Router } from "express";
import { AuthorController } from "../controllers/AuthorController";
import { authenticate, requireAdmin } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { publicCache } from "../middlewares/publicCache";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { createAuthorSchema, updateAuthorSchema } from "../validators/author.validator";

export function buildAuthorRouter(controller: AuthorController): Router {
  const router = Router();

  router.get("/", publicCache(300), asyncHandler(controller.list));
  router.post(
    "/",
    authenticate,
    requireAdmin,
    validate(createAuthorSchema),
    asyncHandler(controller.create)
  );
  router.patch(
    "/:id",
    authenticate,
    requireAdmin,
    validate(updateAuthorSchema),
    asyncHandler(controller.update)
  );
  router.delete("/:id", authenticate, requireAdmin, asyncHandler(controller.delete));

  return router;
}
