// Vercel Serverless Function — proxies OpenAI API calls from the browser
// Avoids CORS issues with direct browser-to-OpenAI requests.

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiKey, body } = req.body;

    if (!apiKey || !body) {
      return res.status(400).json({ error: 'Missing apiKey or body' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await response.text();

    // Forward the status and response from OpenAI
    res.status(response.status);
    res.setHeader('Content-Type', 'application/json');
    return res.send(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Proxy error' });
  }
}
