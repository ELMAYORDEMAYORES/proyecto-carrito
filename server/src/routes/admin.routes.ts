import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { rejectTenantSchema } from "../schemas/admin.schema.js";
import * as adminController from "../controllers/admin.controller.js";

const router = Router();

router.use(authenticate, authorize("SUPER_ADMIN"));

router.get("/tenants", adminController.listTenants);
router.get("/stats", adminController.stats);
router.post("/tenants/:id/approve", adminController.approve);
router.post(
  "/tenants/:id/reject",
  validate(rejectTenantSchema),
  adminController.reject
);

export default router;
