import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { uploadSingleImage } from "../middleware/upload.js";
import { updateTenantSchema } from "../schemas/tenant.schema.js";
import * as tenantController from "../controllers/tenant.controller.js";

const router = Router();

router.use(authenticate, authorize("OWNER"));

router.get("/", tenantController.getMe);
router.patch("/", validate(updateTenantSchema), tenantController.updateMe);
router.post("/logo", uploadSingleImage, tenantController.uploadLogo);
router.post("/banner", uploadSingleImage, tenantController.uploadBanner);

export default router;
