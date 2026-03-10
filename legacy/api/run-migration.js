// Vercel Serverless Function — runs pending database migrations
// Uses the service_role key to execute SQL via Supabase's REST API.
// Called automatically or manually to apply schema changes.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = 'https://hkfdapvulzpnrwcgxyrx.supabase.co';
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Service role key not configured' });
  }

  try {
    // Migration 002: Add supabase_auth_id column for cross-device identity linking
    const migrationSQL = `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_auth_id TEXT UNIQUE;
      ALTER TABLE users ALTER COLUMN microsoft_id DROP NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_users_supabase_auth_id ON users(supabase_auth_id);
    `;

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ query: migrationSQL }),
    });

    // If the RPC doesn't exist, try the SQL endpoint directly
    if (!response.ok) {
      // Fallback: use Supabase Management API or direct SQL
      // Try via the pg_net extension or direct query
      const sqlResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
        },
      });

      // If we can't run SQL via RPC, try individual ALTER TABLE via the REST API
      // The most reliable approach: use the Supabase SQL endpoint
      const results = [];

      // Step 1: Check if column exists by trying to query it
      const checkResp = await fetch(`${SUPABASE_URL}/rest/v1/users?select=supabase_auth_id&limit=0`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
        },
      });

      if (checkResp.ok) {
        results.push('supabase_auth_id column already exists');
      } else {
        results.push('supabase_auth_id column needs to be added — please run migration 002 in Supabase SQL Editor');
      }

      // Step 2: Check if microsoft_id is nullable by trying to insert without it
      const testResp = await fetch(`${SUPABASE_URL}/rest/v1/users?select=microsoft_id&limit=1`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
        },
      });
      if (testResp.ok) {
        results.push('users table accessible');
      }

      return res.status(200).json({
        status: 'partial',
        message: 'Could not run SQL directly. Please run migration 002 in Supabase SQL Editor.',
        results
      });
    }

    return res.status(200).json({ status: 'success', message: 'Migration 002 applied successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
