import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { UPLOADS_DIR } from "../config/uploads.js";
import { ApiError } from "./ApiError.js";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length < 12) {
    return null;
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

export function assertAllowedImage(buffer: Buffer): string {
  const mime = detectImageMime(buffer);
  if (!mime) {
    throw ApiError.badRequest(
      "El archivo no es una imagen válida (solo JPG, PNG o WebP)"
    );
  }
  return mime;
}

export async function saveImageBuffer(
  buffer: Buffer,
  mime: string
): Promise<string> {
  const ext = MIME_TO_EXT[mime];
  const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;
  await fs.promises.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.promises.writeFile(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

export function deleteImageByUrl(url: string): Promise<void> {
  const base = path.basename(url);
  if (!base || base === ".." || base === ".") {
    return Promise.resolve();
  }
  const target = path.join(UPLOADS_DIR, base);
  return fs.promises.unlink(target).catch(() => undefined);
}
