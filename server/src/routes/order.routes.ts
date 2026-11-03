import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { updateOrderStatusSchema } from "../schemas/order.schema.js";
import * as orderController from "../controllers/order.controller.js";

const router = Router();

router.use(authenticate, authorize("OWNER"));

router.get("/", orderController.list);
router.get("/export", orderController.exportCsv);
router.get("/:id", orderController.get);
router.patch(
  "/:id/status",
  validate(updateOrderStatusSchema),
  orderController.updateStatus
);

export default router;
