// GitHub OAuth Configuration
// Replace these with your actual GitHub OAuth App credentials
const GITHUB_OAUTH_CONFIG = {
    // Get these from https://github.com/settings/developers
    CLIENT_ID: 'YOUR_GITHUB_CLIENT_ID',
    
    // Redirect URI must match exactly what's configured in GitHub
    REDIRECT_URI: window.location.origin + '/auth.html',
    
    // Scopes needed for the dashboard
    SCOPES: 'repo read:org',
    
    // GitHub OAuth endpoints
    AUTHORIZE_URL: 'https://github.com/login/oauth/authorize',
    TOKEN_URL: 'https://github.com/login/oauth/access_token',
    
    // Proxy service for token exchange (needed for client-side only apps)
    // Options:
    // 1. Your own backend server
    // 2. Netlify/Vercel functions
    // 3. GitHub Gatekeeper: https://github.com/prose/gatekeeper
    // 4. OAuth proxy services
    PROXY_URL: 'https://your-oauth-proxy.herokuapp.com/authenticate',
    
    // Storage keys
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'github_access_token',
        USER_DATA: 'github_user_data',
        STATE: 'oauth_state',
        EXPIRES_AT: 'token_expires_at'
    }
};

// OAuth helper functions
class GitHubOAuth {
    constructor() {
        this.config = GITHUB_OAUTH_CONFIG;
    }
    
    // Generate random state for CSRF protection
    generateState() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // Start OAuth flow
    login() {
        const state = this.generateState();
        sessionStorage.setItem(this.config.STORAGE_KEYS.STATE, state);
        
        const params = new URLSearchParams({
            client_id: this.config.CLIENT_ID,
            redirect_uri: this.config.REDIRECT_URI,
            scope: this.config.SCOPES,
            state: state,
            allow_signup: 'true'
        });
        
        window.location.href = `${this.config.AUTHORIZE_URL}?${params}`;
    }
    
    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getAccessToken();
        if (!token) return false;
        
        // Check if token is expired (if expiry is stored)
        const expiresAt = localStorage.getItem(this.config.STORAGE_KEYS.EXPIRES_AT);
        if (expiresAt && new Date() > new Date(expiresAt)) {
            this.logout();
            return false;
        }
        
        return true;
    }
    
    // Get stored access token
    getAccessToken() {
        return localStorage.getItem(this.config.STORAGE_KEYS.ACCESS_TOKEN);
    }
    
    // Store access token
    setAccessToken(token, expiresIn = null) {
        localStorage.setItem(this.config.STORAGE_KEYS.ACCESS_TOKEN, token);
        
        if (expiresIn) {
            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
            localStorage.setItem(this.config.STORAGE_KEYS.EXPIRES_AT, expiresAt.toISOString());
        }
    }
    
    // Get user data
    async getUserData() {
        const cached = localStorage.getItem(this.config.STORAGE_KEYS.USER_DATA);
        if (cached) return JSON.parse(cached);
        
        const token = this.getAccessToken();
        if (!token) return null;
        
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                localStorage.setItem(this.config.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
                return userData;
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
        
        return null;
    }
    
    // Logout
    logout() {
        Object.values(this.config.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
    }
    
    // Make authenticated API request
    async apiRequest(url, options = {}) {
        const token = this.getAccessToken();
        if (!token) {
            throw new Error('Not authenticated');
        }
        
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.status === 401) {
            // Token might be expired or revoked
            this.logout();
            throw new Error('Authentication failed. Please login again.');
        }
        
        return response;
    }
}

// Export for use in other files
const githubOAuth = new GitHubOAuth();
