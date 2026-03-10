// Vercel Serverless Function — auto-confirms a Supabase Auth user's email
// Uses the service_role key (set as SUPABASE_SERVICE_ROLE_KEY env var in Vercel)
// to call the Supabase Admin API and confirm the user immediately after sign-up.

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
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Use Supabase Admin API to update user and confirm email
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        email_confirm: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Supabase admin confirm failed:', response.status, errText);
      return res.status(response.status).json({ error: 'Failed to confirm user' });
    }

    return res.status(200).json({ confirmed: true });
  } catch (error) {
    console.error('Confirm user error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
