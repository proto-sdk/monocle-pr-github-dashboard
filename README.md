# Monocle PR GitHub Dashboard

A clean, professional GitHub Pull Request dashboard for tracking PRs from the btc-mining/miner-firmware repository. Features a light theme interface with real-time data updates and comprehensive filtering capabilities.

## Features

- **GitHub PR Tracking**
  - Real-time tracking of pull requests from btc-mining/miner-firmware repository
  - Color-coded PR status labels
    - Green: Open PRs
    - Red: Closed PRs
    - Purple: Merged PRs
  - PR Statistics Display
    - Percentage breakdown of PR statuses
    - Visual indicators with matching status colors
  - Advanced Filtering
    - Filter by author
    - Filter by title
    - Filter by status (Open/Closed/Merged)
  - Clean separation of PR titles and status indicators
  - 15-minute auto-refresh timer with countdown display

## Design

- Professional light theme with clean white background (#f6f8fa)
- White PR cards with subtle borders
- GitHub-style UI design
- Responsive layout with clean visual hierarchy
- Optimized for readability and professional use

## Technical Details

- Pure HTML and inline styles for maximum reliability
- Minimal JavaScript for core functionality
- GitHub API Integration:
  - Supports both authenticated and unauthenticated access
  - GitHub Personal Access Token (PAT) for higher rate limits
  - Fetches last 100 PRs from the repository
  - Real-time data updates

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/proto-sdk/monocle-pr-github-dashboard.git
   cd monocle-pr-github-dashboard
   ```

2. **Add GitHub Personal Access Token (Optional but recommended):**
   - Generate a PAT from GitHub Settings > Developer settings > Personal access tokens
   - Enter the token in the dashboard's token input field
   - Token is saved securely in browser's localStorage

## Usage

1. Open the dashboard in your browser:
   - Local: `file:///path/to/monocle-pr-github-dashboard/index.html`
   - Or serve via HTTP server: `python3 -m http.server 8000`

2. Enter your GitHub Personal Access Token (optional):
   - Without token: 60 API requests/hour limit
   - With token: 5000 API requests/hour limit

3. Click "Refresh" to load pull requests

4. Use filters to find specific PRs:
   - Filter by author username
   - Filter by PR title keywords
   - Filter by status (Open/Closed/Merged)

5. Dashboard auto-refreshes every 15 minutes

## Deployment

The dashboard can be deployed using GitHub Pages:
1. Enable GitHub Pages in repository settings
2. Select source branch (main) and folder (root)
3. Access via: `https://[username].github.io/monocle-pr-github-dashboard/`

## Development

To modify the dashboard:
1. Clone the repository
2. Make changes to `index.html`
3. Test locally by opening the file in a browser
4. Commit and push changes
5. GitHub Pages will automatically update

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
