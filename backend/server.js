const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Health check route
app.get('/', (req, res) => {
    res.send('The Movie Backend API is live and running!');
});

// Middleware
app.use(cors());
app.use(express.json());

// Proxy route for TMDB
// Using a generic route that captures all requests to /api/tmdb/...
app.use('/api/tmdb', async (req, res) => {
    try {
        // Extract the endpoint from the incoming URL (e.g., /movie/popular)
        const endpoint = req.url.split('?')[0].replace(/^\//, '');
        if (!endpoint) return res.status(400).json({ error: 'Endpoint is required' });

        const queryParams = new URLSearchParams(req.query).toString();

        const tmdbUrl = `https://api.themoviedb.org/3/${endpoint}?${queryParams}`;

        const response = await axios.get(tmdbUrl, {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('TMDB API Error:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({ error: 'Failed to fetch from TMDB' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//Hey
