-- ============================================================================
-- Thayyalkkari — Supabase schema
--
-- Run this ONCE in your Supabase project's SQL Editor (Dashboard > SQL Editor
-- > New query > paste this whole file > Run). See docs/SUPABASE_SETUP.md for
-- the full walkthrough, including how to create your own superadmin account
-- afterwards.
--
-- Safe to re-run on a fresh project; it is NOT idempotent against a project
-- that already has these objects (drop them first if you need to re-apply).
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type user_role as enum ('admin', 'superadmin');
create type approval_status as enum ('pending', 'approved', 'rejected');
create type order_status as enum (
  'order_received', 'measurement_taken', 'cutting_started', 'stitching_in_progress',
  'finishing_work', 'ready_for_trial', 'completed', 'delivered'
);

-- ----------------------------------------------------------------------------
-- profiles — one row per auth.users row, created automatically on sign-up.
-- role/status default to the "shop owner awaiting approval" case; a superadmin
-- is promoted manually after signing up normally (see docs/SUPABASE_SETUP.md).
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role user_role not null default 'admin',
  status approval_status not null default 'pending',
  shop_id uuid,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- shops
-- ----------------------------------------------------------------------------
create table shops (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  slug text unique not null,
  name text not null,
  malayalam_name text,
  tagline_en text not null,
  tagline_ml text not null,
  description_en text not null,
  description_ml text not null,
  location text not null,
  address_en text not null,
  address_ml text not null,
  phone text not null,
  whatsapp text not null,
  email text,
  banner_image text not null,
  logo_image text,
  years_of_experience integer not null default 0,
  categories jsonb not null default '[]'::jsonb, -- [{ "en": "...", "ml": "..." }]
  badges jsonb not null default '[]'::jsonb,
  rating numeric not null default 0,
  review_count integer not null default 0,
  working_days_en text not null default '',
  working_days_ml text not null default '',
  working_hours text not null default '',
  show_call boolean not null default true,
  show_whatsapp boolean not null default true,
  show_email boolean not null default true,
  status approval_status not null default 'pending',
  created_at timestamptz not null default now()
);

alter table profiles
  add constraint profiles_shop_id_fkey foreign key (shop_id) references shops(id) on delete set null;

-- ----------------------------------------------------------------------------
-- services
-- ----------------------------------------------------------------------------
create table services (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  title_en text not null,
  title_ml text not null,
  description_en text not null default '',
  description_ml text not null default '',
  estimated_days text not null,
  price_range text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table products (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  name_en text not null,
  name_ml text not null,
  category_en text not null,
  category_ml text not null,
  description_en text not null default '',
  description_ml text not null default '',
  image text not null,
  size text,
  price numeric,
  enquiry_only boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- reviews (seeded/managed by owners; no public write flow in the app yet)
-- ----------------------------------------------------------------------------
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment_en text not null,
  comment_ml text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- tracking_orders
-- ----------------------------------------------------------------------------
create table tracking_orders (
  code text primary key,
  shop_id uuid not null references shops(id) on delete cascade,
  customer_name text not null,
  item_type_en text not null,
  item_type_ml text not null,
  order_date date not null,
  expected_date date not null,
  status order_status not null default 'order_received',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Auto-create a profile row whenever someone signs up via Supabase Auth.
-- ----------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, status)
  values (new.id, new.email, 'admin', 'pending');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- is_superadmin() — used everywhere below to gate privileged writes.
-- security definer so it can read `profiles` even from inside a policy on
-- another table without recursive-RLS issues.
-- ----------------------------------------------------------------------------
create or replace function is_superadmin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'superadmin'
  );
$$;

-- ----------------------------------------------------------------------------
-- Guard triggers: only a superadmin can flip approval status / role, no
-- matter what a client sends in an UPDATE payload. This is the enforcement
-- point for the whole approval workflow — without it, an admin could just
-- set their own shop's status to 'approved' directly.
-- ----------------------------------------------------------------------------
create or replace function enforce_shop_status_guard()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status and not is_superadmin() then
    new.status := old.status;
  end if;
  return new;
end;
$$;

create trigger shops_status_guard
  before update on shops
  for each row execute function enforce_shop_status_guard();

create or replace function enforce_profile_guard()
returns trigger
language plpgsql
as $$
begin
  if (new.role is distinct from old.role or new.status is distinct from old.status)
     and not is_superadmin() then
    new.role := old.role;
    new.status := old.status;
  end if;
  return new;
end;
$$;

create trigger profiles_guard
  before update on profiles
  for each row execute function enforce_profile_guard();

-- ----------------------------------------------------------------------------
-- get_database_size() — powers the superadmin "DB storage" widget.
-- Superadmin-only; anyone else calling it gets an error, not a number.
-- ----------------------------------------------------------------------------
create or replace function get_database_size()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_superadmin() then
    raise exception 'forbidden';
  end if;
  return pg_database_size(current_database());
end;
$$;

grant execute on function get_database_size() to authenticated;

-- ----------------------------------------------------------------------------
-- lookup_tracking_code() — the ONLY way the public /track page reads orders.
-- tracking_orders has no public SELECT policy (see below), so this is the
-- sole path in: it returns one row by exact code, so knowing a code lets you
-- look up that order, but there is no way to list/enumerate all orders.
-- ----------------------------------------------------------------------------
create or replace function lookup_tracking_code(p_code text)
returns setof tracking_orders
language sql
security definer
set search_path = public
as $$
  select * from tracking_orders where upper(code) = upper(p_code) limit 1;
$$;

grant execute on function lookup_tracking_code(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table profiles enable row level security;
alter table shops enable row level security;
alter table services enable row level security;
alter table products enable row level security;
alter table reviews enable row level security;
alter table tracking_orders enable row level security;

-- profiles
create policy "read own profile" on profiles for select
  using (id = auth.uid());
create policy "superadmin reads all profiles" on profiles for select
  using (is_superadmin());
create policy "users update own profile" on profiles for update
  using (id = auth.uid());
create policy "superadmin updates all profiles" on profiles for update
  using (is_superadmin());

-- shops
create policy "public reads approved shops" on shops for select
  using (status = 'approved');
create policy "owner reads own shop" on shops for select
  using (owner_id = auth.uid());
create policy "superadmin reads all shops" on shops for select
  using (is_superadmin());
create policy "authenticated creates own shop" on shops for insert
  with check (owner_id = auth.uid());
create policy "owner updates own shop" on shops for update
  using (owner_id = auth.uid());
create policy "superadmin updates all shops" on shops for update
  using (is_superadmin());
create policy "superadmin deletes shops" on shops for delete
  using (is_superadmin());

-- services
create policy "public reads services of approved shops" on services for select
  using (exists (select 1 from shops where shops.id = services.shop_id and shops.status = 'approved'));
create policy "owner manages own services" on services for all
  using (exists (select 1 from shops where shops.id = services.shop_id and shops.owner_id = auth.uid()))
  with check (exists (select 1 from shops where shops.id = services.shop_id and shops.owner_id = auth.uid()));
create policy "superadmin manages all services" on services for all
  using (is_superadmin()) with check (is_superadmin());

-- products
create policy "public reads products of approved shops" on products for select
  using (exists (select 1 from shops where shops.id = products.shop_id and shops.status = 'approved'));
create policy "owner manages own products" on products for all
  using (exists (select 1 from shops where shops.id = products.shop_id and shops.owner_id = auth.uid()))
  with check (exists (select 1 from shops where shops.id = products.shop_id and shops.owner_id = auth.uid()));
create policy "superadmin manages all products" on products for all
  using (is_superadmin()) with check (is_superadmin());

-- reviews
create policy "public reads reviews of approved shops" on reviews for select
  using (exists (select 1 from shops where shops.id = reviews.shop_id and shops.status = 'approved'));
create policy "owner manages own reviews" on reviews for all
  using (exists (select 1 from shops where shops.id = reviews.shop_id and shops.owner_id = auth.uid()))
  with check (exists (select 1 from shops where shops.id = reviews.shop_id and shops.owner_id = auth.uid()));
create policy "superadmin manages all reviews" on reviews for all
  using (is_superadmin()) with check (is_superadmin());

-- tracking_orders — deliberately NO public select policy; see
-- lookup_tracking_code() above for how the public /track page reads these.
create policy "owner manages own orders" on tracking_orders for all
  using (exists (select 1 from shops where shops.id = tracking_orders.shop_id and shops.owner_id = auth.uid()))
  with check (exists (select 1 from shops where shops.id = tracking_orders.shop_id and shops.owner_id = auth.uid()));
create policy "superadmin manages all orders" on tracking_orders for all
  using (is_superadmin()) with check (is_superadmin());
