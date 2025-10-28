# GitHub OAuth Setup Guide

This Bitcoin Dashboard now supports GitHub OAuth authentication for secure access without exposing Personal Access Tokens in code.

## Features

- ✅ **Secure Authentication**: No PATs stored in code
- ✅ **User Profile Display**: Shows GitHub avatar and username
- ✅ **Session Management**: Login/logout functionality
- ✅ **Fallback Option**: Can still use PAT if OAuth not configured
- ✅ **Token Storage**: Secure browser localStorage
- ✅ **CSRF Protection**: State parameter validation

## Setup Instructions

### Option 1: GitHub OAuth App (Recommended for Production)

1. **Create a GitHub OAuth App**
   - Go to https://github.com/settings/developers
   - Click "New OAuth App"
   - Fill in the details:
     - **Application name**: Bitcoin Dashboard
     - **Homepage URL**: Your dashboard URL
     - **Authorization callback URL**: `https://yourdomain.com/auth.html`
   - Click "Register application"

2. **Configure the Dashboard**
   - Copy your **Client ID** from GitHub
   - Open `oauth-config.js`
   - Replace `YOUR_GITHUB_CLIENT_ID` with your actual Client ID

3. **Set Up Token Exchange Backend**
   
   Since GitHub OAuth requires a client secret for token exchange, you need a backend. Options:

   **a) Vercel Serverless Function** (Easy & Free)
   ```javascript
   // api/github-auth.js
   export default async function handler(req, res) {
     const { code } = req.query;
     
     const response = await fetch('https://github.com/login/oauth/access_token', {
       method: 'POST',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         client_id: process.env.GITHUB_CLIENT_ID,
         client_secret: process.env.GITHUB_CLIENT_SECRET,
         code: code,
       }),
     });
     
     const data = await response.json();
     res.json(data);
   }
   ```

   **b) Netlify Function** (Also Free)
   ```javascript
   // netlify/functions/github-auth.js
   exports.handler = async (event) => {
     const { code } = event.queryStringParameters;
     
     const response = await fetch('https://github.com/login/oauth/access_token', {
       method: 'POST',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         client_id: process.env.GITHUB_CLIENT_ID,
         client_secret: process.env.GITHUB_CLIENT_SECRET,
         code: code,
       }),
     });
     
     const data = await response.json();
     
     return {
       statusCode: 200,
       body: JSON.stringify(data),
     };
   };
   ```

   **c) GitHub Gatekeeper** (Self-hosted)
   - Deploy https://github.com/prose/gatekeeper
   - Update `PROXY_URL` in `oauth-config.js`

4. **Deploy Your Dashboard**
   - Deploy to GitHub Pages, Vercel, or Netlify
   - Ensure callback URL matches GitHub OAuth App settings

### Option 2: Personal Access Token (Quick Start)

If you don't want to set up OAuth immediately:

1. Create a PAT at https://github.com/settings/tokens
2. Open the dashboard
3. Click "Or use a Personal Access Token"
4. Enter your PAT
5. Click "Use PAT"

The PAT will be stored securely in browser localStorage.

## File Structure

```
proto-github-dashboard/
├── index-oauth.html      # Main dashboard with OAuth
├── auth.html             # OAuth callback handler
├── oauth-config.js       # OAuth configuration
├── OAUTH_SETUP.md       # This file
└── index.html           # Original dashboard (backup)
```

## Security Features

1. **State Parameter**: Prevents CSRF attacks
2. **Secure Storage**: Tokens stored in localStorage (not in code)
3. **Token Validation**: Validates token on each session
4. **Logout Function**: Clears all stored credentials
5. **HTTPS Required**: OAuth only works over HTTPS

## Testing Locally

For local testing without OAuth:

1. Open `index-oauth.html` in your browser
2. Use the PAT option for authentication
3. Dashboard will work with all features

## Environment Variables

If using a backend service, set these environment variables:

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

## Troubleshooting

### "Invalid callback URL"
- Ensure the callback URL in GitHub matches exactly
- Include the protocol (http:// or https://)
- Check for trailing slashes

### "Authentication failed"
- Check if your PAT has the required scopes
- For OAuth, ensure backend is properly configured
- Check browser console for detailed errors

### "CORS errors"
- OAuth requires a backend for token exchange
- Use one of the backend options above
- Or use PAT for local development

## API Endpoints Used

The dashboard uses these GitHub API endpoints:
- `/user` - Get authenticated user info
- `/repos/{owner}/{repo}/pulls` - Get pull requests (if needed)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - Feel free to modify and use as needed.

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify OAuth App settings in GitHub
3. Ensure backend service is running
4. Try PAT authentication as fallback
