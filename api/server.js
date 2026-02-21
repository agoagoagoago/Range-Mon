const express = require('express');
const app = express();

const GITHUB_PAT = process.env.GITHUB_PAT;
const DEPLOY_PASSWORD = process.env.DEPLOY_PASSWORD;
const FINNHUB_KEY = process.env.FINNHUB_KEY;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://range-mon.onrender.com';
const REPO = 'agoagoagoago/Range-Mon';
const FILE_PATH = 'data.json';
const BRANCH = 'master';

app.use(express.json({ limit: '2mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.post('/api/verify', (req, res) => {
  const { password } = req.body;
  if (!password || password !== DEPLOY_PASSWORD) {
    return res.status(401).json({ error: 'Invalid deploy password.' });
  }
  res.json({ ok: true });
});

app.post('/api/deploy', async (req, res) => {
  const { data, password } = req.body;

  if (!password || password !== DEPLOY_PASSWORD) {
    return res.status(401).json({ error: 'Invalid deploy password.' });
  }
  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ error: 'No data provided.' });
  }

  const apiUrl = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;
  const headers = {
    'Authorization': `token ${GITHUB_PAT}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Range-Mon-API'
  };

  try {
    // Get current file SHA
    let sha = null;
    const getResp = await fetch(apiUrl, { headers });
    if (getResp.ok) {
      const fileInfo = await getResp.json();
      sha = fileInfo.sha;
    } else if (getResp.status === 401 || getResp.status === 403) {
      return res.status(500).json({ error: 'Server token rejected by GitHub.' });
    }

    // Commit updated data.json
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const body = {
      message: `Update settlement data (${data.length} entries)`,
      content,
      branch: BRANCH
    };
    if (sha) body.sha = sha;

    const putResp = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    if (putResp.ok) {
      res.json({ ok: true, entries: data.length });
    } else {
      const err = await putResp.json();
      res.status(putResp.status).json({ error: err.message || 'GitHub commit failed.' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/news', async (req, res) => {
  if (!FINNHUB_KEY) {
    return res.status(500).json({ error: 'News API key not configured.' });
  }
  try {
    const resp = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`);
    if (!resp.ok) throw new Error('Finnhub HTTP ' + resp.status);
    const articles = await resp.json();
    const top = articles.slice(0, 10).map(a => ({
      headline: a.headline,
      url: a.url,
      source: a.source,
      datetime: a.datetime,
      image: a.image,
      summary: a.summary
    }));
    res.json(top);
  } catch (e) {
    res.status(502).json({ error: 'Failed to fetch news: ' + e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Range-Mon API listening on port ${PORT}`));
