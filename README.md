# Thayyalkkari (തയ്യൽക്കാരി)

A multi-shop tailoring platform. Customers discover tailoring shops, browse services
and dresses for sale, submit stitching requests over WhatsApp, and track order
progress with a code given by the tailor. Tailors register their own shop and manage
it themselves, subject to superadmin approval. Malayalam by default, with English
support.

**Setup guides:** [Supabase (database + auth)](docs/SUPABASE_SETUP.md) ·
[Cloudflare R2 (image uploads)](docs/CLOUDFLARE_R2_SETUP.md) — do these first; the
app has nothing to show until a Supabase project is connected.

## 1. Stack, and why

| Layer | Choice | Why |
|---|---|---|
| Build tool | **Vite** | The app is a client-rendered catalog + forms + WhatsApp deep links — no server-rendering needs. Vite gives a simpler deploy (static hosting), faster dev loop, and no server runtime to manage. |
| Routing | **React Router v7** | Standard client-side routing for a Vite SPA; nested/dynamic routes (`/shop/:slug`, `/track/:code`) map directly to its API. |
| Language | **TypeScript** | Shared types (`src/types`) for shops, services, products, tracking orders, and profiles keep the database and UI in sync. |
| Database + Auth | **Supabase** (Postgres) | Real relational data, Row Level Security enforcing who can read/write what, built-in email/password auth for shop owners and the superadmin. Free tier is generous for this scale. See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). |
| Image storage | **Cloudflare R2**, via a small Worker | 10GB free, zero egress fees. See [docs/CLOUDFLARE_R2_SETUP.md](docs/CLOUDFLARE_R2_SETUP.md). |
| Styling | **Tailwind CSS v4** | Utility-first, `@theme` tokens for the boutique palette, no separate config file needed. |
| Components | Custom shadcn-style primitives (`src/components/ui`) | Built with `class-variance-authority` + `tailwind-merge`, matching shadcn/ui conventions without the CLI scaffold overhead. |
| Icons | **lucide-react** | |
| Motion | **Framer Motion** | Subtle fade/slide-in and progress-bar animations only. |
| i18n | **i18next + react-i18next** | Malayalam (`ml`) default, English (`en`), detection + persistence via `localStorage`. |

## 2. Folder structure

```
src/
  types/                # Shop, ShopService, ShopProduct, TrackingOrder, Profile, form data
  data/
    trackingOrders.ts    # ORDER_STATUS_SEQUENCE + buildTimeline()/progressFor() helpers
  store/
    mappers.ts           # Postgres row <-> app-type conversion (the seam for supabase/schema.sql)
    authStore.ts          # session + profile (useSession, signUp, signIn, signOut)
    shopsStore.ts          # useShops, useShopBySlug, createShop, updateShop, addService, ...
    ordersStore.ts         # useOrders, createOrder, updateOrderStatus, lookupTrackingCode
  i18n/
    index.ts             # i18next setup
    locales/ml.json       # Malayalam strings
    locales/en.json        # English strings
  hooks/
    useLang.ts            # current language + setter, syncs <html lang>
    usePageTitle.ts         # sets document.title per route
  lib/
    utils.ts              # cn() class merger, t() for LocalizedText
    whatsapp.ts            # wa.me URL builders (stitching request, product enquiry, shop chat)
    tracking.ts             # lookupTrackingCode() wrapper used by /track
    format.ts               # currency / date formatting
    slugify.ts               # shop-name → URL slug
    dashboardPath.ts          # where a logged-in user's "Dashboard" button should go
    imageUpload.ts             # client-side compression + upload to the Cloudflare Worker
    supabaseClient.ts           # Supabase client (reads VITE_SUPABASE_URL / _ANON_KEY)
  components/
    ui/                   # Button, Card, Input, Textarea, Label, Badge, Checkbox, Progress, Container, SectionHeading, Reveal, TiltCard
    layout/                # Header, Footer, LanguageSwitcher, MobileNav, ScrollToTop, ScrollProgress, SkipToContent
    shop/                   # ShopCard, ServiceCard, ProductCard, ReviewCard, StitchingRequestForm
    tracking/                # TrackingSearchBox, TrackingResult, TrackingNotFound, StatusStepper
    home/                     # Hero, ShopsSection, DressesSection, TrackingSection
    admin/                     # BilingualField, LocalizedListField, ImageUploadField, ShopProfileForm,
                               # ServiceEditor, ProductEditor, OrderEditor, NewShopForm
  pages/
    HomePage.tsx, ShopsPage.tsx, ShopPage.tsx, DressesPage.tsx,
    TrackPage.tsx, AboutPage.tsx, ContactPage.tsx, NotFoundPage.tsx
    admin/ShopAdminPage.tsx, admin/SuperAdminPage.tsx
    auth/RegisterPage.tsx, auth/LoginPage.tsx, auth/AddShopPage.tsx, auth/PendingApprovalPage.tsx
  App.tsx                 # Route table (lazy-loaded routes except HomePage)
  main.tsx                # React root, BrowserRouter, i18n import

supabase/
  schema.sql              # full Postgres schema: tables, RLS policies, triggers, RPC functions

worker/                   # Cloudflare Worker: proxies image uploads to R2
  src/index.ts             # upload endpoint (auth check → validate → R2 put → return public URL)
  wrangler.toml            # bucket binding + config

docs/
  SUPABASE_SETUP.md        # full walkthrough: create project, run schema, create superadmin
  CLOUDFLARE_R2_SETUP.md    # full walkthrough: create bucket, deploy worker

.env.example               # VITE_SUPABASE_URL / _ANON_KEY, VITE_UPLOAD_WORKER_URL / _TOKEN
```

## 3. Routes

| Path | Page |
|---|---|
| `/` | Landing page (hero, shops, dresses, tracking entry) |
| `/shops` | All approved shops, searchable + category filters |
| `/shop/:slug` | Individual shop mini-site (hero, about, services, request form, products, reviews) |
| `/dresses` | All dresses/products across approved shops, searchable + category filters |
| `/track` | Tracking search |
| `/track/:code` | Tracking search prefilled + result |
| `/about` | About Thayyalkkari |
| `/contact` | Contact / FAQ |
| `/register` | Shop owner sign-up (email + password, no email confirmation) |
| `/login` | Shop owner / superadmin login |
| `/add-shop` | Self-service "create my shop" step, shown right after registering |
| `/pending-approval` | Holding screen for a registered shop awaiting superadmin approval |
| `/shop/:slug/admin` | **Shop admin** — that shop's own dashboard (requires login as its owner, or superadmin) |
| `/superadmin` | **Platform admin** — approve/reject shops, manage every shop, DB storage widget |
| `*` | 404 |

The admin/auth routes aren't linked from the header/footer nav (aside from the
header's Login/Dashboard button, which swaps based on session state) — see §5 for
the full registration → approval flow.

## 4. Data model

See [`src/types/index.ts`](src/types/index.ts) for the app-facing shapes and
[`supabase/schema.sql`](supabase/schema.sql) for the actual Postgres tables —
`src/store/mappers.ts` converts between the two. Every user-facing string that
differs by language uses `LocalizedText` (`{ ml: string; en: string }`).

- **Shop** — `ownerId`, `status` (`pending`/`approved`/`rejected`), profile fields,
  contact info (`phone`, `whatsapp`, `email`), `showCall`/`showWhatsapp`/`showEmail`
  toggles, categories/badges, `services[]`, `products[]`, `reviews[]`.
- **ShopService** — title, description, estimated delivery, price range.
- **ShopProduct** — name, category, image, price or `enquiryOnly`.
- **TrackingOrder** — code, shop, customer, item, dates, `status`, `progressPercent`,
  `timelineSteps[]`.
- **Profile** — one row per Supabase Auth user: `role` (`admin`/`superadmin`),
  `status` (approval state), `shopId`.

## 5. Registration and approval flow

There's no seed/demo data anymore — every shop on the platform is created by a real
tailor going through this flow (or by you, acting as the first user, if you want a
shop of your own):

1. **`/register`** — email + password, no email confirmation required (Supabase's
   "Confirm email" setting is off — see [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)).
   A `profiles` row is created automatically (`role: admin`, `status: pending`).
2. **`/add-shop`** — immediately after registering, fill in the shop's details
   (same fields as the admin's own Profile tab: name, tagline, description, contact
   info, images, hours, categories). This creates the `shops` row (`status: pending`).
3. **`/pending-approval`** — holding screen. The admin can still click through to
   their own `/shop/:slug/admin` from here to keep filling in services/products
   while waiting — the shop just isn't publicly visible yet.
4. **Superadmin approves** on `/superadmin` → "Pending Approvals". This is the only
   way `status` can flip to `approved` — enforced by a Postgres trigger, not just
   client-side UI, so an admin can't approve themselves.
5. Once approved, the shop appears in `/shops`, `/dresses`, and the homepage, and
   logging in takes the owner straight to their dashboard.

**Becoming superadmin yourself** isn't a public flow (there's no UI for it — that
would be a security hole). You register normally, then manually flip your own
`profiles` row to `role: superadmin` in the Supabase dashboard. Full steps in
[docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## 6. Shop admin dashboard

`/shop/:slug/admin` (owner or superadmin only, enforced by Row Level Security, not
just the route guard) has four tabs:

- **Profile** — edit everything about the shop, including the `showCall` /
  `showWhatsapp` / `showEmail` toggles that control which contact buttons appear on
  the public shop page.
- **Services** — add/edit/delete stitching services.
- **Products** — add/edit/delete dresses for sale ("add cloth to sell").
- **Orders** — create a tracking order (generates the next `TK-XXXX` code to hand
  the customer) and update its status as work progresses; the public `/track` page
  reflects status changes immediately.

## 7. Superadmin dashboard

`/superadmin` (requires `profiles.role = 'superadmin'`) has:

- **Database Storage** widget — calls a `SECURITY DEFINER` Postgres function
  (`get_database_size()`) to show how much of Supabase's free-tier Postgres storage
  is used, so you can see the free-tier ceiling coming before you hit it.
- **Pending Approvals** — every shop awaiting review, with Approve/Reject.
- **All Shops** — every approved/rejected shop, with links to view the live page,
  jump into that shop's admin, or delete it entirely.

## 8. WhatsApp integration

`src/lib/whatsapp.ts` builds `https://wa.me/<number>?text=<encoded message>` links:

- `buildStitchingRequestWhatsAppUrl(shop, formData)` — used by the stitching request form on submit.
- `buildProductEnquiryWhatsAppUrl(shop, product, lang)` — used by "Enquire" on dress/product cards.
- `buildShopEnquiryWhatsAppUrl(shop)` — used by the shop page's "Chat / Enquire" button.

The browser opens WhatsApp (web or app) directly with the message prefilled — no
server involved. The shop's WhatsApp number lives on `Shop.whatsapp`, and the
`showWhatsapp` toggle controls whether the button appears at all.

## 9. How to run locally

**You need a Supabase project connected before anything will work** — see
[docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) (schema + env vars) and, if you
want image uploads, [docs/CLOUDFLARE_R2_SETUP.md](docs/CLOUDFLARE_R2_SETUP.md).

```bash
npm install
cp .env.example .env.local   # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (and R2 vars if using uploads)
npm run dev       # http://localhost:5173
npm run build     # type-checks (tsc -b) then builds to dist/
npm run preview   # preview the production build
```

## 10. How to add/update translations

Edit [`src/i18n/locales/ml.json`](src/i18n/locales/ml.json) and
[`src/i18n/locales/en.json`](src/i18n/locales/en.json) — both files share the same key
structure. Add a new key to both files, then use `t("your.key")` (from
`useTranslation()` in `react-i18next`) anywhere in a component. For strings that live
in data (shop/service/product text), use the `LocalizedText` shape (`{ ml, en }`) and
render with `t(field, lang)` from `src/lib/utils.ts`, where `lang` comes from
`useLang()`.

## 11. Security model

- **Row Level Security is on for every table.** Public visitors read only
  `status = 'approved'` rows; owners read/write their own shop regardless of status;
  superadmin reads/writes everything. See [`supabase/schema.sql`](supabase/schema.sql).
- **Tracking orders have no public SELECT policy at all** — the `/track` page goes
  through a `SECURITY DEFINER` function (`lookup_tracking_code`) that returns one row
  by exact code, so a code lets you look up that one order with no way to enumerate
  every order in the database.
- **Approval/role changes are guarded by Postgres triggers**, not just RLS policies —
  even a crafted update payload can't flip `shops.status` or `profiles.role` unless
  the request comes from an authenticated superadmin session.
- **The Cloudflare Worker never exposes R2 credentials to the browser** — see
  [docs/CLOUDFLARE_R2_SETUP.md](docs/CLOUDFLARE_R2_SETUP.md) for why.

## 12. Extending further

- **Multiple shops per owner** — the schema is currently one shop per `profiles` row
  (`profiles.shop_id`). Supporting multiple shops per owner means dropping that
  column in favor of a join table and updating `dashboardPathForProfile()` to handle
  a list instead of a single shop.
- **Persisting stitching requests** — `StitchingRequestForm` currently only opens a
  WhatsApp deep link. To also save the request, insert into a new `stitching_requests`
  table (RLS: owner reads their shop's requests) from its `handleSubmit`.
- **Reference-image upload in the stitching request form** — still UI-only
  (`File | null`, never sent anywhere). Point it at the same Cloudflare Worker used
  by the admin forms once that flow needs to persist.
- **Customer accounts / reviews** — there's deliberately no customer-facing login;
  reviews are currently owner-managed data, not customer-submitted. Adding that would
  mean a third `profiles.role` and a public-write RLS policy on `reviews` scoped to
  the review's own author.
