# Monocle PR Dashboard - Serverless API

This serverless API proxy keeps your GitHub Personal Access Token secure on the server while allowing your dashboard to fetch PR data.

## 🚀 Quick Start (Local Testing)

1. **Install dependencies:**
```bash
cd serverless-api
npm install
```

2. **Set your GitHub PAT:**
```bash
export GITHUB_PAT="ghp_your_token_here"
```

3. **Run the local server:**
```bash
npm start
```

4. **Test the API:**
```bash
# Check rate limit
curl http://localhost:3000/api/github/rate_limit

# Get PRs
curl http://localhost:3000/api/github/repos/btc-mining/miner-firmware/pulls
```

5. **Open the secure dashboard:**
```bash
open ../index-secure.html
```

## 📦 Deployment to Blockcell

### Step 1: Prepare the API files

1. Update the PAT in `api-proxy.js`:
   - Replace `YOUR_PAT_HERE` with your actual GitHub PAT
   - Or better: Set it as an environment variable on Blockcell

2. Update CORS origins in `api-proxy.js`:
   - Add your Blockcell domain to `ALLOWED_ORIGINS`

### Step 2: Deploy to Blockcell

```bash
# From the monocle-pr-github-dashboard directory
blockcell manage_site \
  --site_name monocle-pr-api \
  --action upload \
  --directory_path ./serverless-api
```

### Step 3: Deploy the Dashboard

```bash
# Create a deployment folder
mkdir -p deploy-dashboard
cp index-secure.html deploy-dashboard/index.html
cp -r assets deploy-dashboard/
cp -r images deploy-dashboard/
cp manifest.json deploy-dashboard/

# Update the API URL in index.html
# Change: const API_BASE_URL = 'https://blockcell.sqprod.co/sites/monocle-pr-api'

# Deploy the dashboard
blockcell manage_site \
  --site_name monocle-pr-dashboard \
  --action upload \
  --directory_path ./deploy-dashboard
```

### Step 4: Access Your Secure Dashboard

- API: `https://blockcell.sqprod.co/sites/monocle-pr-api/`
- Dashboard: `https://blockcell.sqprod.co/sites/monocle-pr-dashboard/`

## 🔒 Security Features

1. **PAT Never Exposed:** Your GitHub token stays on the server
2. **CORS Protection:** Only allowed origins can access the API
3. **No Client-Side Secrets:** Dashboard has zero authentication code
4. **Rate Limit Headers:** Passed through from GitHub API

## 🏗️ Architecture

```
User → Dashboard (Blockcell) → API Proxy (Blockcell) → GitHub API
         ↑                          ↑
    No PAT here!              PAT stored here
```

## 🛠️ Configuration

### Environment Variables
- `GITHUB_PAT`: Your GitHub Personal Access Token
- `PORT`: Server port (default: 3000)

### API Endpoints
- `/`: API documentation page
- `/api/github/*`: Proxy to GitHub API

### CORS Origins
Update `ALLOWED_ORIGINS` in `api-proxy.js` to include your domains:
```javascript
const ALLOWED_ORIGINS = [
    'https://blockcell.sqprod.co',
    'https://your-domain.com',
    'http://localhost:8000'
];
```

## 📝 Notes

- The API proxy adds authentication headers automatically
- All GitHub API endpoints are supported
- Rate limits are passed through from GitHub
- Works with both public and private repositories (based on PAT permissions)

## 🚨 Troubleshooting

1. **CORS errors:** Check that your domain is in `ALLOWED_ORIGINS`
2. **401 Unauthorized:** Verify your GitHub PAT is valid
3. **Rate limit exceeded:** Check X-RateLimit headers in response
4. **Connection refused:** Ensure the API server is running

## 📄 License

Part of the Monocle PR Dashboard project
