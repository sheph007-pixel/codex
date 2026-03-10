-- Migration 006: Add attributes JSONB to contacts, create activities table
-- Part of the Next.js modernization migration.

-- ============================================================
-- CONTACTS: Add flexible attributes column
-- Stores arbitrary key-value pairs (title, phone, linkedin, etc.)
-- ============================================================
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}';

-- GIN index for fast JSONB queries on attributes
CREATE INDEX IF NOT EXISTS idx_contacts_attributes ON contacts USING GIN (attributes);

-- ============================================================
-- ACTIVITIES: Unified activity timeline
-- Tracks emails, notes, calls, meetings, status changes, etc.
-- The metadata JSONB column stores type-specific data
-- (e.g. email subject/snippet, call duration, meeting link).
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN (
    'email_sent', 'email_received',
    'note', 'call', 'meeting',
    'status_change', 'task', 'custom'
  )),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for activity queries
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_company ON activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_occurred ON activities(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(user_id, type);
CREATE INDEX IF NOT EXISTS idx_activities_metadata ON activities USING GIN (metadata);

-- ============================================================
-- RLS for activities (matches existing permissive pattern)
-- ============================================================
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY activities_anon ON activities FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY activities_authenticated ON activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
