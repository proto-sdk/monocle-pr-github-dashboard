const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the current directory
app.use(express.static('.'));

// GitHub API proxy endpoint
app.get('/api/github/*', async (req, res) => {
    try {
        // Get the GitHub token from environment variable or config
        const token = process.env.GITHUB_TOKEN || require('./config.js').config?.githubToken;
        
        if (!token) {
            return res.status(500).json({ error: 'GitHub token not configured' });
        }

        // Extract the GitHub API path from the request
        const githubPath = req.params[0];
        const queryString = req.url.split('?')[1] || '';
        const githubUrl = `https://api.github.com/${githubPath}${queryString ? '?' + queryString : ''}`;

        // Make request to GitHub API
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(githubUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Proto-Dashboard/1.0'
            }
        });

        const data = await response.text();
        
        // Forward the response
        res.status(response.status);
        res.set('Content-Type', response.headers.get('content-type'));
        res.send(data);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy request failed' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
