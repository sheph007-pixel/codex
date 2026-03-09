-- Add indexes on updated_at for efficient incremental refresh queries
CREATE INDEX IF NOT EXISTS idx_companies_updated_at ON companies(user_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_contacts_updated_at ON contacts(user_id, updated_at);
