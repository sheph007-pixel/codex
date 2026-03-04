-- Kennion CRM - Supabase Database Schema
-- This replaces browser-only IndexedDB/localStorage with a proper PostgreSQL backend.
-- All data is now server-side with automatic daily backups.

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  microsoft_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COMPANIES (identified by email domain)
-- ============================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  company_name TEXT,
  company_type TEXT CHECK (company_type IN ('hot', 'warm', 'cold', NULL)),
  is_starred BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  is_followup BOOLEAN DEFAULT false,
  followup_date TIMESTAMPTZ,
  last_activity_date TIMESTAMPTZ,
  last_sent_date TIMESTAMPTZ,
  last_received_date TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  received_count INTEGER DEFAULT 0,
  proposal_stage TEXT,
  proposal_notes TEXT,
  merged_into TEXT,
  enrichment JSONB DEFAULT '{}',
  custom_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, domain)
);

-- ============================================================
-- CONTACTS (individual email addresses within a company)
-- ============================================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  is_starred BOOLEAN DEFAULT false,
  last_activity_date TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  received_count INTEGER DEFAULT 0,
  enrichment JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, email)
);

-- ============================================================
-- USER SETTINGS (key-value store for all preferences)
-- Stores: column_config, email_signature, throttle_settings,
--         openai_key, client_id, contact_name_overrides, etc.
-- ============================================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, key)
);

-- ============================================================
-- SCAN METADATA (per-user email scan state)
-- Stays per-device since deltaLink is browser-specific,
-- but stored server-side so it survives cache clears.
-- ============================================================
CREATE TABLE scan_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  last_scan_time TIMESTAMPTZ,
  full_scan_done BOOLEAN DEFAULT false,
  delta_link TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, device_id)
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_companies_user ON companies(user_id);
CREATE INDEX idx_companies_domain ON companies(user_id, domain);
CREATE INDEX idx_companies_type ON companies(user_id, company_type);
CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_settings_user ON user_settings(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Since we use Microsoft OAuth (not Supabase Auth), we use
-- permissive policies with the anon key. The app filters by
-- user_id client-side. For tighter security, switch to
-- Supabase Auth or use a service_role key server-side.
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_metadata ENABLE ROW LEVEL SECURITY;

-- Allow full access via anon key (app handles user scoping)
CREATE POLICY users_anon ON users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY companies_anon ON companies FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY contacts_anon ON contacts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY settings_anon ON user_settings FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY scan_anon ON scan_metadata FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER scan_metadata_updated_at BEFORE UPDATE ON scan_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RPC: Bulk upsert companies (for efficient sync)
-- ============================================================
CREATE OR REPLACE FUNCTION upsert_company(
  p_user_id UUID,
  p_domain TEXT,
  p_company_name TEXT DEFAULT NULL,
  p_company_type TEXT DEFAULT NULL,
  p_is_starred BOOLEAN DEFAULT false,
  p_is_archived BOOLEAN DEFAULT false,
  p_is_flagged BOOLEAN DEFAULT false,
  p_is_blocked BOOLEAN DEFAULT false,
  p_is_followup BOOLEAN DEFAULT false,
  p_followup_date TIMESTAMPTZ DEFAULT NULL,
  p_last_activity_date TIMESTAMPTZ DEFAULT NULL,
  p_last_sent_date TIMESTAMPTZ DEFAULT NULL,
  p_last_received_date TIMESTAMPTZ DEFAULT NULL,
  p_sent_count INTEGER DEFAULT 0,
  p_received_count INTEGER DEFAULT 0,
  p_proposal_stage TEXT DEFAULT NULL,
  p_proposal_notes TEXT DEFAULT NULL,
  p_merged_into TEXT DEFAULT NULL,
  p_enrichment JSONB DEFAULT '{}',
  p_custom_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  result_id UUID;
BEGIN
  INSERT INTO companies (
    user_id, domain, company_name, company_type,
    is_starred, is_archived, is_flagged, is_blocked, is_followup,
    followup_date, last_activity_date, last_sent_date, last_received_date,
    sent_count, received_count, proposal_stage, proposal_notes,
    merged_into, enrichment, custom_data
  ) VALUES (
    p_user_id, p_domain, p_company_name, p_company_type,
    p_is_starred, p_is_archived, p_is_flagged, p_is_blocked, p_is_followup,
    p_followup_date, p_last_activity_date, p_last_sent_date, p_last_received_date,
    p_sent_count, p_received_count, p_proposal_stage, p_proposal_notes,
    p_merged_into, p_enrichment, p_custom_data
  )
  ON CONFLICT (user_id, domain) DO UPDATE SET
    company_name = COALESCE(EXCLUDED.company_name, companies.company_name),
    company_type = COALESCE(EXCLUDED.company_type, companies.company_type),
    is_starred = EXCLUDED.is_starred,
    is_archived = EXCLUDED.is_archived,
    is_flagged = EXCLUDED.is_flagged,
    is_blocked = EXCLUDED.is_blocked,
    is_followup = EXCLUDED.is_followup,
    followup_date = EXCLUDED.followup_date,
    last_activity_date = GREATEST(EXCLUDED.last_activity_date, companies.last_activity_date),
    last_sent_date = GREATEST(EXCLUDED.last_sent_date, companies.last_sent_date),
    last_received_date = GREATEST(EXCLUDED.last_received_date, companies.last_received_date),
    sent_count = GREATEST(EXCLUDED.sent_count, companies.sent_count),
    received_count = GREATEST(EXCLUDED.received_count, companies.received_count),
    proposal_stage = COALESCE(EXCLUDED.proposal_stage, companies.proposal_stage),
    proposal_notes = COALESCE(EXCLUDED.proposal_notes, companies.proposal_notes),
    merged_into = COALESCE(EXCLUDED.merged_into, companies.merged_into),
    enrichment = companies.enrichment || EXCLUDED.enrichment,
    custom_data = companies.custom_data || EXCLUDED.custom_data
  RETURNING id INTO result_id;
  RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
