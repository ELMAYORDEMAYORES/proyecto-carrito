import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { orderLimiter } from "../middleware/rateLimiter.js";
import { createOrderSchema } from "../schemas/catalog.schema.js";
import * as catalogController from "../controllers/catalog.controller.js";

const router = Router();

router.get("/:slug", catalogController.getStore);
router.get("/:slug/categories", catalogController.listCategories);
router.get("/:slug/products", catalogController.listProducts);
router.get("/:slug/products/:id", catalogController.getProduct);
router.post(
  "/:slug/orders",
  orderLimiter,
  validate(createOrderSchema),
  catalogController.createOrder
);

export default router;
