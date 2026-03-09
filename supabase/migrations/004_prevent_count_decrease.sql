-- Prevent email counts from decreasing during upserts.
-- The client-side sync uses Supabase JS .upsert() which replaces all columns.
-- If the client syncs before the email scan completes (or after a page reload
-- with empty Sets), it can overwrite valid counts with 0.
-- This trigger ensures sent_count and received_count never decrease.

CREATE OR REPLACE FUNCTION prevent_count_decrease()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sent_count < OLD.sent_count THEN
    NEW.sent_count = OLD.sent_count;
  END IF;
  IF NEW.received_count < OLD.received_count THEN
    NEW.received_count = OLD.received_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_prevent_count_decrease
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION prevent_count_decrease();

CREATE TRIGGER contacts_prevent_count_decrease
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION prevent_count_decrease();
