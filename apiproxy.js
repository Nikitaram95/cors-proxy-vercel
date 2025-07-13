const fetch = require('node-fetch');

export default async function handler(req, res) {
  // CORS заголовки для всех запросов
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter required' });
  }

  try {
    console.log('🔄 Proxying:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VercelProxy)',
        'Accept': 'image/*,*/*;q=0.8',
        'Referer': 'https://system.letbefit.ru/',
      },
      timeout: 30000,
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Source responded with ${response.status}` 
      });
    }

    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    const buffer = await response.buffer();
    return res.send(buffer);

  } catch (error) {
    console.error('❌ Proxy error:', error);
    return res.status(500).json({ 
      error: 'Proxy failed',
      details: error.message 
    });
  }
}
