-- Setup Database Schema for NESTLIST on Supabase (PostgreSQL)
-- Copy and run this script in your Supabase SQL Editor.

-- 1. Create USERS table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Tenant', 'Agent', 'Landlord', 'Caretaker', 'Admin')),
    phone TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    is_verified BOOLEAN DEFAULT TRUE,
    favorites JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index user lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 2. Create LISTINGS table
CREATE TABLE IF NOT EXISTS public.listings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    property_type TEXT NOT NULL,
    role_type TEXT NOT NULL,
    location JSONB NOT NULL DEFAULT '{}'::jsonb,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    pricing JSONB NOT NULL DEFAULT '{}'::jsonb,
    media JSONB NOT NULL DEFAULT '{}'::jsonb,
    author JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_featured BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    views INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0
);

-- Index listing queries
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_property_type ON public.listings(property_type);

-- 3. Create PAYMENTS table
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'KES',
    provider TEXT DEFAULT 'mpesa',
    status TEXT DEFAULT 'pending',
    phone_number TEXT,
    checkout_request_id TEXT,
    mpesa_receipt_number TEXT,
    transaction_id TEXT,
    payment_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index payment transactions
CREATE INDEX IF NOT EXISTS idx_payments_checkout_id ON public.payments(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_payments_listing_id ON public.payments(listing_id);

-- 4. Create INQUIRIES table
CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    tenant_name TEXT NOT NULL,
    tenant_email TEXT NOT NULL,
    tenant_phone TEXT DEFAULT '',
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_listing_id ON public.inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_tenant_id ON public.inquiries(tenant_id);

-- 5. Create NOTIFICATIONS table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Enable Row Level Security (RLS) on tables for maximum protection (Optional custom rules)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Post default permissive bypass policies for Server Admin/Service Role connections
CREATE POLICY "Allow service role access on users" ON public.users USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role access on listings" ON public.listings USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role access on payments" ON public.payments USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role access on inquiries" ON public.inquiries USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role access on notifications" ON public.notifications USING (true) WITH CHECK (true);
