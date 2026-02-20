// Cloudflare Worker — CORS proxy with edge caching
export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    const url = new URL(request.url);
    const target = url.searchParams.get('url');

    // Only allow whitelisted URLs
    const allowed = ['https://query', 'https://nfs.faireconomy.media/', 'https://publicreporting.cftc.gov/'];
    if (!target || !allowed.some(prefix => target.startsWith(prefix))) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Use Cloudflare Cache API to avoid hammering upstream
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);

    // Check cache first
    let cached = await cache.match(cacheKey);
    if (cached) {
      // Return cached response with CORS headers
      const body = await cached.text();
      return new Response(body, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Cache': 'HIT',
        }
      });
    }

    try {
      const resp = await fetch(target, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const data = await resp.text();

      // Only cache successful responses
      if (resp.ok) {
        const ttl = target.includes('faireconomy') ? 1800 : target.includes('cftc.gov') ? 1800 : 30; // 30min for econ & COT, 30s for price
        const cacheResp = new Response(data, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=' + ttl,
          }
        });
        await cache.put(cacheKey, cacheResp);
      }

      return new Response(data, {
        status: resp.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Cache': 'MISS',
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
