// Vercel Serverless Function — keeps Supabase free-tier database awake
// Called by Vercel Cron every 5 minutes to prevent cold starts (20+ second delays).

export default async function handler(req, res) {
  const SUPABASE_URL = 'https://hkfdapvulzpnrwcgxyrx.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrZmRhcHZ1bHpwbnJ3Y2d4eXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzIwNzEsImV4cCI6MjA4ODIwODA3MX0.qaTBjpbFmqFqYyrNYQMNmnOcMcW8Aarww93hTG0cmfs';

  try {
    const start = Date.now();
    const response = await fetch(SUPABASE_URL + '/rest/v1/users?select=id&limit=1', {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      },
    });
    const elapsed = Date.now() - start;
    const status = response.ok ? 'ok' : 'error';
    return res.status(200).json({
      status,
      elapsed_ms: elapsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
