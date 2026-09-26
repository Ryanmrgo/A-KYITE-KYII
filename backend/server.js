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

app.get('/', (req, res) => {
    res.json({ name: 'movie-backend', status: 'ok' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', tmdbConfigured: Boolean(process.env.TMDB_API_KEY) });
});

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
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
