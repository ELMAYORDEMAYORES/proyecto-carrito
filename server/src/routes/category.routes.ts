import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema.js";
import * as categoryController from "../controllers/category.controller.js";

const router = Router();

router.use(authenticate, authorize("OWNER"));

router.get("/", categoryController.list);
router.post("/", validate(createCategorySchema), categoryController.create);
router.patch("/:id", validate(updateCategorySchema), categoryController.update);
router.delete("/:id", categoryController.remove);

export default router;
