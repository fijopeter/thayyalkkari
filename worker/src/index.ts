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

function withCors(headers: HeadersInit = {}): HeadersInit {
  return {
    ...headers,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Filename",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: withCors() });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: withCors() });
    }

    if (request.headers.get("Authorization") !== `Bearer ${env.UPLOAD_TOKEN}`) {
      return new Response("Unauthorized", { status: 401, headers: withCors() });
    }

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

    const key = `uploads/${crypto.randomUUID()}.${ext}`;
    await env.BUCKET.put(key, body, { httpMetadata: { contentType } });

    const url = `${env.PUBLIC_BASE_URL.replace(/\/+$/, "")}/${key}`;

    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: withCors({ "Content-Type": "application/json" }),
    });
  },
};
