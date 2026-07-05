# Cloudflare R2 setup (image uploads)

Product/banner/logo photos in the admin forms (`ImageUploadField`) upload
through a small Cloudflare Worker in [`worker/`](../worker/) that writes to an
R2 bucket. R2 needs a secret access key to write to it — the browser can
never hold that key directly, so the Worker sits in between: it's the only
thing that touches R2, and the frontend only ever talks to the Worker over
plain HTTPS with a shared bearer token.

```
you (browser) → compress image → POST to Worker (with token) → Worker writes to R2 → returns public URL
```

## Why a Worker instead of talking to R2 directly?

R2 speaks the S3 API, which is authenticated with an access-key-id/secret
pair — the kind of credential that must never ship inside a browser bundle
(anyone could read it via devtools and gain full read/write access to your
bucket). Cloudflare Workers can bind directly to an R2 bucket without needing
those S3 keys at all — the binding *is* the authorization, scoped to that one
Worker. So the Worker holds no secret except a single shared upload token it
checks before accepting a request.

## One-time setup

1. **Create a free Cloudflare account** at
   [dash.cloudflare.com](https://dash.cloudflare.com) if you don't have one.
2. **Create the R2 bucket:** dashboard → R2 Object Storage → Create bucket →
   name it `thayyalkkari-images` (or update the name in
   `worker/wrangler.toml` to match).
3. **Enable public access** on that bucket: bucket → Settings → Public
   access → Allow Access → copy the **Public R2.dev Bucket URL** it gives
   you.
4. Paste that URL into `worker/wrangler.toml`'s `PUBLIC_BASE_URL`.
5. **Install and authenticate wrangler** (Cloudflare's CLI):
   ```bash
   cd worker
   npm install
   npx wrangler login   # opens a browser to authorize your Cloudflare account
   ```
6. **Set the upload secret** — pick a long random string, you'll reuse it in
   step 8:
   ```bash
   npx wrangler secret put UPLOAD_TOKEN
   ```
7. **Deploy the worker:**
   ```bash
   npx wrangler deploy
   ```
   This prints your Worker's URL, something like
   `https://thayyalkkari-uploads.<your-subdomain>.workers.dev`.
8. **Point the frontend at it** — back in the project root:
   ```bash
   cp .env.example .env.local
   ```
   and fill in `VITE_UPLOAD_WORKER_URL` (the URL from step 7) and
   `VITE_UPLOAD_TOKEN` (the same string you set in step 6). Restart
   `npm run dev` after editing `.env.local`.
9. When you deploy the frontend itself (Vercel/Netlify/Cloudflare Pages), add
   those same two env vars in that host's dashboard so the production build
   has them too.

Until this is configured, the "Upload Photo" buttons show an error and the
plain URL text field underneath still works as a fallback (paste a link to
an already-hosted image). The superadmin dashboard's "Image Storage" widget
also depends on this — it calls the same Worker's `GET /usage` endpoint,
which lists every object in the bucket and sums their size, so it'll show a
"not configured" message until steps 5–8 are done.

## Deleting images

Images clean themselves up automatically in the common cases:
- Uploading a new photo over an existing one (banner, logo, product photo)
  deletes the old file it's replacing.
- Deleting a product deletes its photo; deleting a shop deletes its
  banner/logo and every one of its products' photos.

There's also a manual **Remove** button next to every "Upload Photo" button
(`ImageUploadField`) for clearing an image without replacing it. All of this
goes through the Worker's `DELETE` endpoint (same auth token as uploads),
which only ever deletes URLs that actually start with your bucket's
`PUBLIC_BASE_URL` — pasting an external image URL and clicking Remove just
clears the field locally without touching R2, since there's nothing of yours
to delete.

If you deployed the Worker before this endpoint existed, redeploy
(`npx wrangler deploy`) to pick it up — delete/cleanup calls silently no-op
against an older Worker version (they're best-effort and never block the
surrounding action), so nothing breaks, but storage won't actually be
reclaimed until you redeploy.

## Limits and behavior worth knowing

- Images are resized client-side to a max of 1600px and re-encoded as JPEG
  before upload (`src/lib/imageUpload.ts`) — a phone photo shrinks from a few
  MB to a few hundred KB, which stretches R2's 10GB free tier a long way.
- The Worker hard-caps uploads at 8MB and only accepts JPEG/PNG/WebP/GIF.
- **Once the bucket reaches the 10GB free-tier limit, new uploads are
  refused** — the Worker checks total bucket usage before every write and
  returns a clear error instead of writing past the limit. This is enforced
  in the Worker itself (`R2_FREE_TIER_BYTES` in `worker/src/index.ts`), so it
  can't be bypassed from the client; the admin forms also show a warning and
  disable the upload button proactively once they know the limit's been hit.
  If you upgrade past the free tier, update that constant and redeploy
  (`npx wrangler deploy`).
- The `UPLOAD_TOKEN` check is a shared secret — good enough to stop random
  internet traffic from hitting your Worker, not per-user authentication (all
  shop admins share the same upload path). Rotate it if it ever leaks:
  `wrangler secret put UPLOAD_TOKEN` again, then update `.env.local` /
  your host's env vars to match.

## Local development

`worker/` is a separate mini-project (its own `package.json`) so it doesn't
affect the main app's dependency tree. `npx wrangler dev` inside `worker/`
runs the upload endpoint locally against your real R2 bucket if you want to
test changes to `worker/src/index.ts` before deploying.
