# Proto GitHub Dashboard

A secure, SSO-protected dashboard that combines Bitcoin network statistics with GitHub PR tracking functionality. The dashboard features a clean, modern interface with a dark theme and real-time data updates.

## Security

- **GitHub OAuth Integration**
  - Secure Single Sign-On (SSO) through GitHub
  - Required authentication for all dashboard access
  - Proper token handling and secure storage
  - Automatic session management

## Features

- **Bitcoin Statistics**
  - Current Bitcoin Price (via CoinGecko API)
  - Network Hash Rate (via mempool.space API)
  - Block Height (via Blockstream API)
  - Auto-refreshes every 5 minutes

- **GitHub PR Tracking**
  - Color-coded PR status labels
    - Green: Open PRs
    - Red: Closed PRs
    - Purple: Merged PRs
  - PR Statistics Display
    - Percentage breakdown of PR statuses
    - Visual indicators with matching status colors
  - Clean separation of PR titles and status indicators

## Design

- Modern black background (#000000) for optimal contrast
- Unified card styling with consistent orange theme
- Responsive layout with clean visual hierarchy
- Block logo favicon for browser identification

## Technical Details

- Pure HTML and inline styles for maximum reliability
- Minimal JavaScript for core functionality
- Secure API Integrations:
  - GitHub OAuth for authentication
  - CoinGecko API for Bitcoin price
  - mempool.space API for network hash rate
  - Blockstream API for block height
  - GitHub API for PR data (authenticated access)

## Setup

1. Configure OAuth:
   - Set up GitHub OAuth application
   - Update `clientId` in index-secure.html
   - Configure `redirectUri` for your deployment
   - Set up backend endpoint for OAuth callback handling

2. Backend Requirements:
   - Endpoint for handling OAuth callback: `/auth/github/callback`
   - Token exchange implementation
   - Proper CORS and security headers

## Usage

1. Access the dashboard URL
2. Log in with GitHub credentials
3. Upon successful authentication:
   - Dashboard will load initial data
   - Display current Bitcoin network statistics
   - Show PR status information
   - Auto-refresh every 5 minutes

## Deployment

The dashboard is deployed using GitHub Pages and requires:
1. Proper OAuth configuration
2. Backend service for handling authentication
3. HTTPS endpoint for secure token exchange
4. Appropriate CORS settings

## Development

To modify the dashboard:
1. Clone the repository
2. Set up OAuth credentials
3. Configure backend services
4. Test locally with proper security measures
5. Commit and push changes
6. GitHub Pages will automatically update

## Browser Compatibility

The dashboard uses minimal, standard web technologies for maximum compatibility across modern browsers while maintaining security best practices.

## 🪿 CI/CD with Goose Headless Mode

This repository is configured to use Goose in headless mode for automated CI/CD operations.

### Automated Workflows

The dashboard includes GitHub Actions workflows that use Goose to:
- Automatically test dashboard functionality
- Validate HTML and JavaScript code
- Commit and push updates
- Deploy to GitHub Pages
- Create PR comments with analysis

### Running Goose Locally

#### Quick Start
```bash
# Run the headless script
./run-goose-headless.sh "Your commit message" true
```

#### Manual Recipe Execution
```bash
# Run the CI/CD recipe
goose run --recipe .goose/recipes/dashboard-cicd.yaml --headless

# Run with custom parameters
goose run --recipe .goose/recipes/dashboard-cicd.yaml \
  --parameter commit_message="feat: update dashboard" \
  --parameter run_tests=true \
  --headless
```

### GitHub Actions Setup

1. **Add Secrets to Repository:**
   - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` (for Goose LLM provider)
   - `DASHBOARD_GITHUB_TOKEN` (for dashboard API access)

2. **Workflow Triggers:**
   - Manual dispatch via GitHub Actions UI
   - Scheduled daily runs at 2 AM UTC
   - On push to main branch
   - On pull request events

3. **Workflow Features:**
   - Automated testing and validation
   - Code analysis and optimization suggestions
   - Documentation updates
   - Automatic commits and pushes
   - PR comment generation

### Recipe Configuration

The `.goose/recipes/dashboard-cicd.yaml` file defines automated tasks:
- Test dashboard functionality
- Update changelog
- Commit changes
- Push to remote
- Create pull requests

### Configuration Files

- `.goose/config.yaml` - Goose configuration for headless mode
- `.github/workflows/goose-cicd.yml` - GitHub Actions workflow
- `run-goose-headless.sh` - Local headless execution script
