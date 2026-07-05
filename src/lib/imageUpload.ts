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
    throw new Error(await extractErrorMessage(response));
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

/** The Worker returns `{ error: "..." }` for known failures (e.g. storage-limit-reached); fall back to a generic message otherwise. */
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) return body.error;
  } catch {
    // Not JSON — fall through to the generic message.
  }
  return `Upload failed (${response.status})`;
}

export interface StorageUsage {
  bytes: number;
  count: number;
  limitBytes: number;
}

/** Fetches total R2 bucket usage from the Worker's /usage endpoint — powers the superadmin storage widget. */
export async function getStorageUsage(): Promise<StorageUsage> {
  const workerUrl = import.meta.env.VITE_UPLOAD_WORKER_URL;
  const token = import.meta.env.VITE_UPLOAD_TOKEN;
  if (!workerUrl || !token) {
    throw new ImageUploadNotConfiguredError();
  }

  const usageUrl = `${workerUrl.replace(/\/+$/, "")}/usage`;
  const response = await fetch(usageUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Fetching storage usage failed (${response.status})`);
  }

  return (await response.json()) as StorageUsage;
}

/**
 * Best-effort delete of a previously-uploaded image, by its public URL.
 * Never throws — this backs both manual "Remove" clicks (where the field
 * should clear regardless of whether the remote file actually went away)
 * and automatic cleanup when a product/shop is deleted (which shouldn't
 * fail just because image cleanup hit a snag). Silently does nothing if
 * uploads aren't configured, or the URL isn't one of ours (e.g. a pasted
 * external link) — the Worker itself checks that.
 */
export async function deleteImage(url: string): Promise<void> {
  const workerUrl = import.meta.env.VITE_UPLOAD_WORKER_URL;
  const token = import.meta.env.VITE_UPLOAD_TOKEN;
  if (!workerUrl || !token || !url) return;

  try {
    await fetch(workerUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    });
  } catch {
    // Best-effort — worst case an orphaned file stays in the bucket.
  }
}
