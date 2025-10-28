// Serverless API Proxy for GitHub API
// This keeps your PAT secure on the server

const GITHUB_PAT = process.env.GITHUB_PAT || 'YOUR_PAT_HERE'; // Set this in environment variables
const ALLOWED_ORIGINS = [
    'https://blockcell.sqprod.co',
    'http://localhost:8000',
    'http://localhost:8080',
    'file://' // For local testing
];

// CORS headers for browser access
const corsHeaders = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

// Main handler function
async function handleRequest(request) {
    const origin = request.headers.get('Origin') || request.headers.get('Referer') || '';
    
    // Check if origin is allowed
    const isAllowed = ALLOWED_ORIGINS.some(allowed => 
        origin.startsWith(allowed) || (allowed === 'file://' && origin === 'null')
    );
    
    const responseHeaders = {
        ...corsHeaders,
        'Access-Control-Allow-Origin': isAllowed ? (origin === 'null' ? '*' : origin) : ALLOWED_ORIGINS[0]
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        return new Response(null, { 
            status: 204,
            headers: responseHeaders
        });
    }

    try {
        // Extract the GitHub API path from the request
        const url = new URL(request.url);
        const githubPath = url.pathname.replace('/api/github/', '');
        
        if (!githubPath) {
            return new Response(JSON.stringify({ 
                error: 'No GitHub API path provided' 
            }), { 
                status: 400,
                headers: responseHeaders
            });
        }

        // Build GitHub API URL with query parameters
        const githubUrl = `https://api.github.com/${githubPath}${url.search}`;
        
        console.log(`Proxying request to: ${githubUrl}`);

        // Make request to GitHub API with PAT
        const githubResponse = await fetch(githubUrl, {
            method: request.method,
            headers: {
                'Authorization': `Bearer ${GITHUB_PAT}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Monocle-PR-Dashboard'
            },
            body: request.method !== 'GET' ? await request.text() : undefined
        });

        // Get response from GitHub
        const data = await githubResponse.text();
        
        // Return response with CORS headers
        return new Response(data, {
            status: githubResponse.status,
            statusText: githubResponse.statusText,
            headers: {
                ...responseHeaders,
                'X-RateLimit-Limit': githubResponse.headers.get('X-RateLimit-Limit') || '',
                'X-RateLimit-Remaining': githubResponse.headers.get('X-RateLimit-Remaining') || '',
                'X-RateLimit-Reset': githubResponse.headers.get('X-RateLimit-Reset') || ''
            }
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to proxy request',
            details: error.message 
        }), { 
            status: 500,
            headers: responseHeaders
        });
    }
}

// Export for different serverless platforms
if (typeof module !== 'undefined' && module.exports) {
    // Node.js / Vercel
    module.exports = async (req, res) => {
        const request = new Request(`https://example.com${req.url}`, {
            method: req.method,
            headers: req.headers,
            body: req.body
        });
        
        const response = await handleRequest(request);
        const body = await response.text();
        
        res.status(response.status);
        Object.entries(response.headers).forEach(([key, value]) => {
            res.setHeader(key, value);
        });
        res.send(body);
    };
} else if (typeof addEventListener === 'function') {
    // Cloudflare Workers
    addEventListener('fetch', event => {
        event.respondWith(handleRequest(event.request));
    });
} else {
    // Deno / Edge Runtime
    serve(handleRequest);
}
