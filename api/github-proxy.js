export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get the GitHub token from environment variable
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
      return res.status(500).json({ error: 'GitHub token not configured' });
    }

    // Make request to GitHub API
    const githubResponse = await fetch(
      'https://api.github.com/repos/btc-mining/miner-firmware/pulls?state=all&base=main&sort=updated&direction=desc&per_page=100',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Proto-Dashboard/1.0'
        }
      }
    );

    const data = await githubResponse.json();
    
    // Forward the response
    res.status(githubResponse.status).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
}
