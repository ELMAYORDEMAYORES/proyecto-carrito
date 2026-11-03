import { assertAllowedImage, saveImageBuffer } from "../utils/file.js";

export async function persistImages(
  files: Express.Multer.File[]
): Promise<string[]> {
  const urls: string[] = [];

  for (const file of files) {
    const mime = assertAllowedImage(file.buffer);
    const url = await saveImageBuffer(file.buffer, mime);
    urls.push(url);
  }

  return urls;
}
