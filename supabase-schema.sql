-- Setup Database Schema for NESTLIST on Supabase (PostgreSQL)
-- Copy and run this script in your Supabase SQL Editor.

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  phone text,
  role text check (role in ('landlord', 'tenant', 'admin')) not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- PROPERTIES
-- ─────────────────────────────────────────
create table properties (
  id uuid default uuid_generate_v4() primary key,
  landlord_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  location text not null,
  county text not null,
  price numeric not null,
  bedrooms int,
  type text check (type in (
    'single_room', 'bedsitter', 'studio',
    '1br', '2br', '3br', '4br', '5br_plus'
  )) not null,
  images text[] default '{}',
  status text check (status in ('available', 'taken')) default 'available',
  is_active boolean default false,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- LISTING PAYMENTS
-- ─────────────────────────────────────────
create table listing_payments (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  landlord_id uuid references profiles(id) on delete cascade not null,
  amount numeric not null,
  property_type text not null,
  mpesa_code text unique,
  status text check (status in ('pending', 'confirmed', 'failed')) default 'pending',
  listing_expires_at timestamptz,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- INQUIRIES
-- ─────────────────────────────────────────
create table inquiries (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  tenant_id uuid references profiles(id) on delete cascade not null,
  landlord_id uuid references profiles(id) on delete cascade not null,
  message text not null,
  status text check (status in ('pending', 'responded', 'closed')) default 'pending',
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────
create table messages (
  id uuid default uuid_generate_v4() primary key,
  inquiry_id uuid references inquiries(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- SAVED PROPERTIES (wishlist)
-- ─────────────────────────────────────────
create table saved_properties (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references profiles(id) on delete cascade not null,
  property_id uuid references properties(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(tenant_id, property_id)
);


-- ═════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═════════════════════════════════════════

alter table profiles enable row level security;
alter table properties enable row level security;
alter table listing_payments enable row level security;
alter table inquiries enable row level security;
alter table messages enable row level security;
alter table saved_properties enable row level security;

-- PROFILES
create policy "Users can view any profile"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- PROPERTIES (only active listings visible to public)
create policy "Anyone can view active properties"
  on properties for select using (is_active = true);

create policy "Landlords can view all their properties"
  on properties for select using (auth.uid() = landlord_id);

create policy "Landlords can insert properties"
  on properties for insert with check (auth.uid() = landlord_id);

create policy "Landlords can update own properties"
  on properties for update using (auth.uid() = landlord_id);

-- LISTING PAYMENTS
create policy "Landlords can view own payments"
  on listing_payments for select using (auth.uid() = landlord_id);

create policy "Landlords can insert payments"
  on listing_payments for insert with check (auth.uid() = landlord_id);

-- INQUIRIES
create policy "Tenants can create inquiries"
  on inquiries for insert with check (auth.uid() = tenant_id);

create policy "Involved parties can view inquiries"
  on inquiries for select
  using (auth.uid() = tenant_id or auth.uid() = landlord_id);

-- MESSAGES
create policy "Involved parties can view messages"
  on messages for select using (
    auth.uid() in (
      select tenant_id from inquiries where id = inquiry_id
      union
      select landlord_id from inquiries where id = inquiry_id
    )
  );

create policy "Sender can insert messages"
  on messages for insert with check (auth.uid() = sender_id);

-- SAVED PROPERTIES
create policy "Tenants manage own saved properties"
  on saved_properties for all using (auth.uid() = tenant_id);


-- ═════════════════════════════════════════
-- AUTOMATION
-- ═════════════════════════════════════════

-- Auto-deactivate expired listings (run as a cron job via pg_cron or Supabase Edge Function)
-- Schedule this to run daily:
-- update properties set is_active = false where expires_at < now() and is_active = true;

-- Function: activate listing after payment confirmed
create or replace function activate_listing()
returns trigger as $$
begin
  if new.status = 'confirmed' and old.status = 'pending' then
    update properties
    set
      is_active = true,
      expires_at = now() + interval '30 days'
    where id = new.property_id;

    update listing_payments
    set listing_expires_at = now() + interval '30 days'
    where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: fires when you confirm a payment
create trigger on_payment_confirmed
  after update on listing_payments
  for each row execute function activate_listing();
