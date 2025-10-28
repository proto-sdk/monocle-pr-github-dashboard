// Local development server for testing the API proxy
// Run with: node server.js

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Set your GitHub PAT here or use environment variable
const GITHUB_PAT = process.env.GITHUB_PAT || 'YOUR_PAT_HERE';
const PORT = process.env.PORT || 3000;

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

// Create server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }

    // Serve index.html for root
    if (pathname === '/' || pathname === '/index.html') {
        const indexPath = path.join(__dirname, 'index.html');
        fs.readFile(indexPath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    // Handle API proxy requests
    if (pathname.startsWith('/api/github/')) {
        const githubPath = pathname.replace('/api/github/', '');
        const githubUrl = `https://api.github.com/${githubPath}${parsedUrl.search || ''}`;

        console.log(`Proxying to: ${githubUrl}`);

        try {
            const fetch = (await import('node-fetch')).default;
            const githubResponse = await fetch(githubUrl, {
                method: req.method,
                headers: {
                    'Authorization': `Bearer ${GITHUB_PAT}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Monocle-PR-Dashboard'
                }
            });

            const data = await githubResponse.text();

            // Set response headers
            const responseHeaders = {
                ...corsHeaders,
                'X-RateLimit-Limit': githubResponse.headers.get('X-RateLimit-Limit') || '',
                'X-RateLimit-Remaining': githubResponse.headers.get('X-RateLimit-Remaining') || '',
                'X-RateLimit-Reset': githubResponse.headers.get('X-RateLimit-Reset') || ''
            };

            res.writeHead(githubResponse.status, responseHeaders);
            res.end(data);

        } catch (error) {
            console.error('Proxy error:', error);
            res.writeHead(500, corsHeaders);
            res.end(JSON.stringify({ error: 'Proxy failed', details: error.message }));
        }
        return;
    }

    // 404 for other paths
    res.writeHead(404, corsHeaders);
    res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🚀 Monocle PR Dashboard API Server                ║
║                                                      ║
║   Local URL: http://localhost:${PORT}                  ║
║   API Endpoint: http://localhost:${PORT}/api/github/*  ║
║                                                      ║
║   Status: ✅ Running                                ║
║                                                      ║
╚══════════════════════════════════════════════════════╝

⚠️  Remember to set your GitHub PAT:
   export GITHUB_PAT="your-token-here"
   
📝 Example API call:
   http://localhost:${PORT}/api/github/repos/btc-mining/miner-firmware/pulls
`);
});
