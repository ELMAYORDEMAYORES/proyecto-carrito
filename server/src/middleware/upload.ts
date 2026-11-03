import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGES_PER_PRODUCT } from "../config/limits.js";

const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.memoryStorage();

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  if (ALLOWED_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest("Solo se permiten imágenes JPG, PNG o WebP"));
  }
}

export const uploadProductImages = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: MAX_IMAGES_PER_PRODUCT },
  fileFilter,
}).array("images", MAX_IMAGES_PER_PRODUCT);

export const uploadSingleImage = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 1 },
  fileFilter,
}).single("image");
