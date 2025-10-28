# Security Details - Proto API PR Dashboard

## 🔐 Personal Access Token (PAT) Configuration

### Current Implementation
**Token Location:** `config.js` (local development only)  
**Token Scope:** `repo` (read-only access to repository data)  
**Token Prefix:** `ghp_` (GitHub Personal Access Token identifier)

### Token Security Measures

1. **Git Ignored:** The `config.js` file is in `.gitignore` to prevent accidental commits
2. **Environment Variables:** Production deployment uses environment variables, not hardcoded tokens
3. **Minimal Permissions:** Token only has read access to public repository data
4. **No Write Access:** Cannot modify repository content, settings, or PRs

### Token Management Best Practices

```javascript
// Development (config.js) - NEVER COMMIT THIS FILE
window.config = {
    githubToken: 'ghp_[YOUR_TOKEN_HERE]'
};

// Production (Environment Variable)
process.env.GITHUB_TOKEN = 'ghp_[YOUR_TOKEN_HERE]'
```

## 🛡️ Security Architecture

### Three-Layer Security Model

#### Layer 1: Network Security
- **Internal Network Only:** Dashboard accessible only within corporate network
- **No Public Exposure:** Not accessible from external internet
- **VPN Required:** Remote access requires corporate VPN connection

#### Layer 2: Application Security
- **Read-Only Operations:** No write/modify capabilities
- **Stateless Design:** No session storage or cookies
- **XSS Protection:** All user inputs sanitized
- **HTTPS Only:** Enforced for all API calls

#### Layer 3: Token Security
- **Server-Side Proxy Ready:** Architecture supports token obfuscation
- **Token Rotation:** Support for automated token rotation
- **Audit Logging:** All API calls logged for security monitoring

## 🔑 PAT Generation Guide

### Creating a Secure PAT for the Dashboard

1. Navigate to GitHub → Settings → Developer Settings → Personal Access Tokens
2. Click "Generate new token (classic)"
3. Set expiration to 90 days (recommended)
4. Select ONLY these scopes:
   - ✅ `repo` (Full control of private repositories)
   - Or more restrictively:
     - ✅ `repo:status` (Access commit status)
     - ✅ `public_repo` (Access public repositories)

### Token Rotation Schedule
- **Frequency:** Every 90 days
- **Process:** Generate new token → Update config → Test → Revoke old token
- **Notification:** Calendar reminder for token expiration

## 🚨 Security Incident Response

### If Token is Compromised:

1. **Immediate Actions:**
   ```bash
   # Revoke token immediately in GitHub
   GitHub → Settings → Developer Settings → Personal Access Tokens → Revoke
   
   # Generate new token
   # Update all deployment configurations
   # Audit recent API activity
   ```

2. **Investigation:**
   - Check GitHub audit logs
   - Review access patterns
   - Identify exposure timeline

3. **Remediation:**
   - Rotate all tokens
   - Update security protocols
   - Document incident

## 🔍 Security Audit Checklist

### Daily Checks
- [ ] Monitor API rate limits
- [ ] Check for unusual access patterns
- [ ] Verify dashboard accessibility (internal only)

### Weekly Checks
- [ ] Review GitHub audit logs
- [ ] Check token expiration dates
- [ ] Validate network restrictions

### Monthly Checks
- [ ] Full security audit
- [ ] Update dependencies
- [ ] Review access permissions
- [ ] Test incident response procedures

## 🌐 Network Access Configuration

### Approved Access Methods
1. **Direct Internal Network:** 10.x.x.x / 192.168.x.x
2. **Corporate VPN:** Required for remote access
3. **Whitelisted IPs:** Specific development machines

### Blocked Access
- ❌ Public Internet
- ❌ Unauthorized VPN connections
- ❌ Mobile devices (unless MDM enrolled)

## 📊 API Rate Limiting

### GitHub API Limits
- **Authenticated Requests:** 5,000 per hour
- **Current Usage:** ~4 requests per hour (with 15-min refresh)
- **Buffer:** 99.92% rate limit available

### Rate Limit Monitoring
```javascript
// Check rate limit status
fetch('https://api.github.com/rate_limit', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
}).then(r => r.json()).then(console.log);
```

## 🔄 Vercel Proxy Implementation (Future)

### Planned Security Enhancement
```javascript
// Serverless function to hide token
export default async function handler(req, res) {
    const token = process.env.GITHUB_TOKEN; // Never exposed to client
    
    const response = await fetch('https://api.github.com/...', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    res.json(await response.json());
}
```

## ⚠️ Security Warnings

### DO NOT:
- ❌ Commit tokens to version control
- ❌ Share tokens via email or chat
- ❌ Use tokens with write permissions
- ❌ Access dashboard from public networks
- ❌ Store tokens in browser localStorage

### ALWAYS:
- ✅ Use environment variables in production
- ✅ Rotate tokens regularly
- ✅ Monitor access logs
- ✅ Keep dashboard internal only
- ✅ Report security concerns immediately

## 📝 Compliance & Governance

### Data Classification
- **Level:** Internal/Confidential
- **Handling:** Restricted to authorized personnel
- **Retention:** No data storage (real-time only)

### Regulatory Compliance
- **SOC 2:** Aligned with access control requirements
- **GDPR:** No personal data stored
- **ISO 27001:** Follows information security standards

---

**Security Contact:** security@proto.com  
**Last Security Review:** October 27, 2025  
**Next Scheduled Review:** January 27, 2026

**Remember: Security is everyone's responsibility. If you see something, say something.**
