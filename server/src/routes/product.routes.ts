import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { uploadProductImages } from "../middleware/upload.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema.js";
import * as productController from "../controllers/product.controller.js";

const router = Router();

router.use(authenticate, authorize("OWNER"));

router.get("/", productController.list);
router.post("/", validate(createProductSchema), productController.create);
router.get("/:id", productController.get);
router.patch("/:id", validate(updateProductSchema), productController.update);
router.delete("/:id", productController.remove);
router.post("/:id/images", uploadProductImages, productController.addImages);
router.delete("/:id/images/:filename", productController.removeImage);

export default router;
