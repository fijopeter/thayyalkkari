const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

/**
 * Downscales and re-encodes an image client-side before it ever hits the
 * network — phone-camera photos are often 3-5MB, which eats through a free
 * storage tier fast. Falls back to the original file if canvas encoding fails.
 */
async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

export class ImageUploadNotConfiguredError extends Error {
  constructor() {
    super(
      "Image upload isn't configured — set VITE_UPLOAD_WORKER_URL and VITE_UPLOAD_TOKEN. See README \"Image uploads (Cloudflare R2)\".",
    );
    this.name = "ImageUploadNotConfiguredError";
  }
}

/** Compresses an image and uploads it via the Cloudflare Worker, returning its public URL. */
export async function uploadImage(file: File): Promise<string> {
  const workerUrl = import.meta.env.VITE_UPLOAD_WORKER_URL;
  const token = import.meta.env.VITE_UPLOAD_TOKEN;
  if (!workerUrl || !token) {
    throw new ImageUploadNotConfiguredError();
  }

  const compressed = await compressImage(file);

  const response = await fetch(workerUrl, {
    method: "POST",
    headers: {
      "Content-Type": compressed.type || "image/jpeg",
      Authorization: `Bearer ${token}`,
      "X-Filename": file.name,
    },
    body: compressed,
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}
