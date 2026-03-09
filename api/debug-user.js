// Diagnostic endpoint — checks the database for a specific user's data.
// Uses the service_role key to bypass RLS and see everything.
// Usage: POST /api/debug-user  { "email": "hunter@kennion.com" }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = 'https://hkfdapvulzpnrwcgxyrx.supabase.co';
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Service role key not configured' });
  }

  const email = (req.body && req.body.email) || 'hunter@kennion.com';
  const results = {};

  const headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
  };

  try {
    // 1. Find ALL user rows matching this email (case-insensitive)
    const usersResp = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=id,email,microsoft_id,supabase_auth_id,display_name,created_at&email=ilike.${encodeURIComponent(email)}&order=created_at`,
      { headers }
    );
    const users = usersResp.ok ? await usersResp.json() : [];
    results.users = users;
    results.user_count = users.length;

    // 2. For each user, count their companies
    for (const user of users) {
      const compResp = await fetch(
        `${SUPABASE_URL}/rest/v1/companies?select=id,domain,company_name&user_id=eq.${user.id}&limit=5`,
        { headers }
      );
      const companies = compResp.ok ? await compResp.json() : [];
      user.company_count_sample = companies.length;
      user.sample_companies = companies.map(c => ({ domain: c.domain, name: c.company_name }));

      // Full count
      const countResp = await fetch(
        `${SUPABASE_URL}/rest/v1/companies?select=id&user_id=eq.${user.id}`,
        { headers, method: 'HEAD' }
      );
      // Use content-range header for count
      const range = countResp.headers.get('content-range');
      user.total_companies = range || 'unknown';
    }

    // 3. Check Supabase Auth users with this email
    const authResp = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`,
      { headers }
    );
    if (authResp.ok) {
      const authData = await authResp.json();
      const authUsers = (authData.users || []).filter(u =>
        u.email && u.email.toLowerCase() === email.toLowerCase()
      );
      results.auth_users = authUsers.map(u => ({
        id: u.id,
        email: u.email,
        confirmed: !!u.email_confirmed_at,
        created_at: u.created_at,
        last_sign_in: u.last_sign_in_at,
      }));
    } else {
      results.auth_users_error = await authResp.text();
    }

    // 4. Also check: are there ANY companies in the database at all?
    const anyCompResp = await fetch(
      `${SUPABASE_URL}/rest/v1/companies?select=id,user_id,domain&limit=5&order=created_at.desc`,
      { headers }
    );
    results.recent_companies = anyCompResp.ok ? await anyCompResp.json() : [];

    // 5. Check ALL users in the system
    const allUsersResp = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=id,email,microsoft_id,supabase_auth_id,created_at&order=created_at`,
      { headers }
    );
    const allUsers = allUsersResp.ok ? await allUsersResp.json() : [];
    results.all_users = allUsers.map(u => ({
      id: u.id,
      email: u.email,
      has_microsoft_id: !!u.microsoft_id,
      has_supabase_auth_id: !!u.supabase_auth_id,
    }));

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
