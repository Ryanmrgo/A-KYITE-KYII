const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const TMDB_API_BASE = 'https://api.themoviedb.org/3/';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/';
const IMAGE_RELAY_BASE = 'https://wsrv.nl/?url=';
const REQUEST_TIMEOUT_MS = 10000;
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.get('/', (req, res) => {
    res.json({ name: 'movie-backend', status: 'ok' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', tmdbConfigured: Boolean(process.env.TMDB_API_KEY) });
});

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origin is not allowed by CORS'));
    },
}));
app.use(express.json());

// Proxy route for TMDB
app.use('/api/tmdb', async (req, res) => {
    try {
        if (!process.env.TMDB_API_KEY) {
            return res.status(503).json({ error: 'TMDB API is not configured' });
        }

        const endpoint = req.path.replace(/^\/+/, '');
        if (!endpoint || endpoint.includes('..')) {
            return res.status(400).json({ error: 'A valid TMDB endpoint is required' });
        }

        const tmdbUrl = new URL(endpoint, TMDB_API_BASE);
        tmdbUrl.searchParams.set('api_key', process.env.TMDB_API_KEY);
        Object.entries(req.query).forEach(([key, value]) => {
            if (Array.isArray(value)) value.forEach((item) => tmdbUrl.searchParams.append(key, item));
            else if (value != null) tmdbUrl.searchParams.set(key, value);
        });

        const response = await axios.get(tmdbUrl.toString(), {
            timeout: REQUEST_TIMEOUT_MS,
            headers: { Accept: 'application/json' },
        });
        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || (error.code === 'ECONNABORTED' ? 504 : 502);
        console.error('TMDB API Error:', error.message);
        res.status(status).json({ error: 'Failed to fetch from TMDB' });
    }
});

// ── Subtitle proxy (subdl.com — FREE, supports TMDB IDs directly) ────────────
const SUBDL_SEARCH = 'https://api.subdl.com/api/v1/subtitles';
const SUBDL_DOWNLOAD_BASE = 'https://dl.subdl.com';
const SUBDL_API_KEY = process.env.SUBDL_API_KEY || '';

// GET /api/subtitles/search?type=movie&tmdb_id=123&languages=en&season_number=1&episode_number=2
app.get('/api/subtitles/search', async (req, res) => {
  try {
    const { type = 'movie', tmdb_id, languages = 'en', season_number, episode_number } = req.query;
    if (!tmdb_id) return res.status(400).json({ error: 'tmdb_id is required' });

    const params = new URLSearchParams();
    params.set('tmdb_id', tmdb_id);
    params.set('type', type === 'tv' ? 'tv' : 'movie');
    params.set('languages', (languages || 'en').split(',')[0].trim());
    if (SUBDL_API_KEY) params.set('api_key', SUBDL_API_KEY);
    if (type === 'tv' && season_number)  params.set('season_number', season_number);
    if (type === 'tv' && episode_number) params.set('episode_number', episode_number);

    const searchUrl = `${SUBDL_SEARCH}?${params}`;
    console.log('[subtitles] search:', searchUrl);

    const response = await axios.get(searchUrl, {
      timeout: REQUEST_TIMEOUT_MS,
      headers: { 'Accept': 'application/json' },
    });

    const raw = response.data?.subtitles;
    if (!Array.isArray(raw) || raw.length === 0) {
      return res.json({ subtitles: [] });
    }

    // Normalise to the shape useSubtitles.js expects
    const subtitles = raw.map((s) => ({
      attributes: {
        language: s.language || 'en',
        download_count: s.download_count || 0,
        release: s.release_name || s.name || '',
        files: [{ file_id: s.url }], // subdl gives a relative /subtitle/xxx.zip path
      },
    }));

    res.json({ subtitles });
  } catch (error) {
    console.error('Subtitle search error:', error.message);
    const status = error.response?.status || 502;
    res.status(status).json({ error: 'Subtitle search failed', detail: error.message });
  }
});

// POST /api/subtitles/download  body: { file_id: "/subtitle/xxx.zip" }
app.post('/api/subtitles/download', async (req, res) => {
  try {
    const { file_id } = req.body;
    if (!file_id) return res.status(400).json({ error: 'file_id is required' });

    // Build full URL — subdl returns relative paths like "/subtitle/xxx.zip"
    const downloadUrl = file_id.startsWith('http') ? file_id : `${SUBDL_DOWNLOAD_BASE}${file_id}`;
    console.log('[subtitles] download:', downloadUrl);

    const zipResponse = await axios.get(downloadUrl, {
      timeout: REQUEST_TIMEOUT_MS,
      responseType: 'arraybuffer',
      headers: { 'Accept': '*/*' },
    });

    // Extract the first .srt file from the zip using JSZip
    const JSZip = require('jszip');
    const zip = await JSZip.loadAsync(zipResponse.data);

    let srtContent = null;
    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.toLowerCase().endsWith('.srt') && !file.dir) {
        srtContent = await file.async('string');
        break;
      }
    }

    if (!srtContent) {
      return res.status(404).json({ error: 'No .srt file found in archive' });
    }

    res.json({ content: srtContent });
  } catch (error) {
    console.error('Subtitle download error:', error.message);
    const status = error.response?.status || 502;
    res.status(status).json({ error: 'Subtitle download failed', detail: error.message });
  }
});

// Redirect image requests through a relay so browsers receive the exact TMDB artwork.
app.use('/api/image', async (req, res) => {
    try {
        const imagePath = req.path.replace(/^\/+/, '');
        if (!/^(?:original|w\d+|h\d+)\/[^/]+\.(?:jpg|jpeg|png|webp)$/i.test(imagePath)) {
            return res.status(400).send('Invalid image path');
        }

        const tmdbImageUrl = TMDB_IMAGE_BASE + imagePath;
        const imageUrl = IMAGE_RELAY_BASE + encodeURIComponent(tmdbImageUrl);
        res.status(302).set('Location', imageUrl).end();
    } catch (error) {
        console.error('Image redirect error:', error.message);
        res.status(500).send('Failed to load image');
    }
});

app.listen(PORT, () => {
    console.log(`Movie backend listening on port ${PORT}`);
});
