-- Add supabase_auth_id column to users table
-- This links Supabase Auth (email/password) accounts to CRM user records,
-- ensuring data loads correctly on any device without needing Microsoft connected.
-- The column is nullable because existing users won't have it until their next login.

ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_auth_id TEXT UNIQUE;

-- Also make microsoft_id nullable — Supabase Auth users don't have a Microsoft ID
-- until they connect their email in Settings.
ALTER TABLE users ALTER COLUMN microsoft_id DROP NOT NULL;

-- Index for fast lookup by supabase_auth_id
CREATE INDEX IF NOT EXISTS idx_users_supabase_auth_id ON users(supabase_auth_id);
