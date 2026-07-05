export interface Env {
  BUCKET: R2Bucket;
  UPLOAD_TOKEN: string;
  PUBLIC_BASE_URL: string;
}

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Client compresses before upload; this is just a hard safety cap.
const MAX_BYTES = 8 * 1024 * 1024;

// Cloudflare R2's free-tier limit — keep in sync with R2_FREE_TIER_BYTES in
// src/lib/storageLimits.ts.
const R2_FREE_TIER_BYTES = 10 * 1024 * 1024 * 1024;

function withCors(headers: HeadersInit = {}): HeadersInit {
  return {
    ...headers,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Filename",
  };
}

/** Lists every object in the bucket and sums their size. */
async function getBucketUsage(env: Env): Promise<{ bytes: number; count: number }> {
  let bytes = 0;
  let count = 0;
  let cursor: string | undefined;

  do {
    const page = await env.BUCKET.list({ cursor, limit: 1000 });
    for (const obj of page.objects) {
      bytes += obj.size;
      count += 1;
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  return { bytes, count };
}

async function handleUpload(request: Request, env: Env): Promise<Response> {
  const contentType = request.headers.get("Content-Type") ?? "";
  const ext = ALLOWED_TYPES[contentType];
  if (!ext) {
    return new Response("Unsupported file type", { status: 415, headers: withCors() });
  }

  const body = await request.arrayBuffer();
  if (body.byteLength === 0) {
    return new Response("Empty file", { status: 400, headers: withCors() });
  }
  if (body.byteLength > MAX_BYTES) {
    return new Response("File too large", { status: 413, headers: withCors() });
  }

  // Hard lock: block the write if it would push the bucket past the free
  // tier, even if the client's own pre-upload check was stale or bypassed.
  const usage = await getBucketUsage(env);
  if (usage.bytes + body.byteLength > R2_FREE_TIER_BYTES) {
    return new Response(
      JSON.stringify({
        error:
          "Image storage limit reached (free tier). Delete some images, or upgrade your Cloudflare R2 plan, before uploading more.",
      }),
      { status: 507, headers: withCors({ "Content-Type": "application/json" }) },
    );
  }

  const key = `uploads/${crypto.randomUUID()}.${ext}`;
  await env.BUCKET.put(key, body, { httpMetadata: { contentType } });

  const url = `${env.PUBLIC_BASE_URL.replace(/\/+$/, "")}/${key}`;

  return new Response(JSON.stringify({ url }), {
    status: 200,
    headers: withCors({ "Content-Type": "application/json" }),
  });
}

/** Powers the superadmin R2 storage widget and the client-side pre-upload capacity check. */
async function handleUsage(env: Env): Promise<Response> {
  const usage = await getBucketUsage(env);
  return new Response(JSON.stringify({ ...usage, limitBytes: R2_FREE_TIER_BYTES }), {
    status: 200,
    headers: withCors({ "Content-Type": "application/json" }),
  });
}

/**
 * Deletes one object by its public URL. Only ever deletes URLs that actually
 * belong to this bucket (start with our own PUBLIC_BASE_URL) — a pasted
 * external image URL just gets reported as "nothing to delete" instead of
 * erroring, since the caller (ImageUploadField) doesn't need to know or care
 * whether an image was ever ours to begin with.
 */
async function handleDelete(request: Request, env: Env): Promise<Response> {
  let body: { url?: string };
  try {
    body = (await request.json()) as { url?: string };
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: withCors({ "Content-Type": "application/json" }),
    });
  }

  if (!body.url) {
    return new Response(JSON.stringify({ error: "Missing url" }), {
      status: 400,
      headers: withCors({ "Content-Type": "application/json" }),
    });
  }

  const base = env.PUBLIC_BASE_URL.replace(/\/+$/, "");
  if (!body.url.startsWith(`${base}/`)) {
    return new Response(JSON.stringify({ ok: true, deleted: false }), {
      status: 200,
      headers: withCors({ "Content-Type": "application/json" }),
    });
  }

  const key = body.url.slice(base.length + 1);
  await env.BUCKET.delete(key);

  return new Response(JSON.stringify({ ok: true, deleted: true }), {
    status: 200,
    headers: withCors({ "Content-Type": "application/json" }),
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: withCors() });
    }

    if (request.headers.get("Authorization") !== `Bearer ${env.UPLOAD_TOKEN}`) {
      return new Response("Unauthorized", { status: 401, headers: withCors() });
    }

    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/usage") {
      return handleUsage(env);
    }

    if (request.method === "DELETE") {
      return handleDelete(request, env);
    }

    if (request.method === "POST") {
      return handleUpload(request, env);
    }

    return new Response("Method not allowed", { status: 405, headers: withCors() });
  },
};
