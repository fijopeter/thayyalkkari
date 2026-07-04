# Supabase setup

Thayyalkkari's database, authentication, and approval workflow all run on
[Supabase](https://supabase.com) (a free-tier Postgres project with built-in
Auth). This doc walks through setting up your own project from scratch.

## 1. Create a project

1. Sign up at [supabase.com](https://supabase.com) (free).
2. **New project** → pick an organization, name it (e.g. `thayyalkkari`), set a
   database password (save it somewhere — you won't need it day-to-day, but
   you'll want it if you ever connect directly via `psql`), pick the region
   closest to your users.
3. Wait ~2 minutes for provisioning.

> **Free tier note:** a Supabase free project pauses after 7 days with no
> activity. Opening the dashboard wakes it back up — fine for early days, just
> don't be surprised if the site is slow to load after a long gap.

## 2. Run the schema

1. In your project, open **SQL Editor** (left sidebar) → **New query**.
2. Open [`supabase/schema.sql`](../supabase/schema.sql) from this repo, copy
   its entire contents, paste into the editor, and click **Run**.
3. It should complete with no errors. This creates every table, the
   Row Level Security policies, and the helper functions (approval guards, the
   database-size lookup, the public tracking-code lookup) described inline as
   comments in that file.

If you need to start over, drop the objects it created (Supabase's **Table
Editor** can drop tables) and re-run the file — it is not written to be safely
re-run on top of itself.

## 3. Turn off email confirmation

Thayyalkkari's registration flow relies on superadmin approval instead of
email verification (so a shop owner can register and immediately see their
"pending approval" screen, without needing a working email inbox mid-visit).

Go to **Authentication → Providers → Email** and turn **Confirm email**
**off**. Without this, `signUp()` won't return a session until the user
clicks a confirmation link, which breaks the flow described below.

## 4. Get your API keys

**Project Settings → API**. You need two values:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon / public key** → `VITE_SUPABASE_ANON_KEY`

(Not the `service_role` key — that one bypasses Row Level Security and must
never be shipped to a browser.)

Add them to `.env.local` in the project root:

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Restart `npm run dev` after editing `.env.local`. When you deploy the
frontend (Vercel/Netlify/Cloudflare Pages), add the same two variables in
that host's dashboard.

## 5. Create your own superadmin account

There's no public UI to become superadmin (that would be a security hole —
anyone could grant themselves platform-wide access). Instead:

1. Run the app (`npm run dev`) and go to `/register`. Sign up with your own
   email and a password, same as any shop owner would.
2. This creates a row in `profiles` with `role = 'admin'`, `status =
   'pending'`. In the Supabase dashboard, go to **Table Editor → profiles**,
   find your row, and change `role` to `superadmin` and `status` to
   `approved`. (Or run this in the SQL Editor instead of clicking through the
   table UI:)
   ```sql
   update profiles set role = 'superadmin', status = 'approved'
   where email = 'you@example.com';
   ```
3. Log out and back in (or just refresh) — you'll now land on `/superadmin`
   instead of the shop-registration flow.

You only need to do this once. From then on, use `/superadmin` to approve
every real shop owner who registers.

## How the approval flow works end to end

1. A tailor goes to `/register`, signs up with email + password (no email
   confirmation needed).
2. They're redirected to `/add-shop` to fill in their shop's details — this
   creates their `shops` row with `status = 'pending'`.
3. They land on `/pending-approval` — a holding screen. They can still click
   through to their own `/shop/:slug/admin` from there to keep filling in
   services, products, etc. while waiting (the shop just isn't publicly
   visible yet).
4. You (superadmin) see them under **Pending Approvals** on `/superadmin` and
   click **Approve**. This flips both `shops.status` and `profiles.status` to
   `approved` — enforced server-side (see the guard triggers in
   `supabase/schema.sql`), so an admin can never approve themselves by editing
   the request payload.
5. Once approved, their shop appears publicly, and logging in takes them
   straight to their `/shop/:slug/admin` dashboard.

## Security model, briefly

- **Row Level Security** is on for every table. Public visitors can only read
  `shops`/`services`/`products`/`reviews` where `status = 'approved'`. Shop
  owners can read/write their own shop regardless of status. Superadmin can
  read/write everything.
- **Tracking orders have no public read policy at all.** The `/track` page
  goes through a `SECURITY DEFINER` function (`lookup_tracking_code`) that
  returns one row by exact code — so knowing a code lets a customer look up
  that one order, but there's no way to list or scrape every order in the
  database.
- **Role/status changes are guarded by triggers**, not just RLS — even if a
  client sent `{ "status": "approved" }` in an update payload, the trigger
  silently reverts it unless the request came from a superadmin session.

## Extending the schema

Adding a column later (e.g. a new shop field) is a normal Postgres migration:
write an `alter table` statement, run it in the SQL Editor, then update
`src/store/mappers.ts` (the row ↔ app-type conversion) and the relevant form
component. See the main [README](../README.md) for the full architecture
picture.
