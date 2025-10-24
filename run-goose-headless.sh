#!/bin/bash

# Goose Headless Mode Runner for PR Dashboard
# This script runs Goose in headless mode to automate dashboard CI/CD tasks

set -e

echo "🪿 Starting Goose Headless Mode for PR Dashboard"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RECIPE_PATH=".goose/recipes/dashboard-cicd.yaml"
COMMIT_MESSAGE="${1:-feat: automated dashboard updates}"
RUN_TESTS="${2:-true}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists goose; then
    echo -e "${RED}Error: Goose is not installed${NC}"
    echo "Please install Goose first: pip install goose-ai"
    exit 1
fi

if ! command_exists git; then
    echo -e "${RED}Error: Git is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"

# Run tests if enabled
if [ "$RUN_TESTS" = "true" ]; then
    echo -e "\n${YELLOW}Running dashboard tests...${NC}"
    
    # Check if index.html exists
    if [ -f "index.html" ]; then
        echo -e "${GREEN}✓ index.html found${NC}"
    else
        echo -e "${RED}✗ index.html not found${NC}"
        exit 1
    fi
    
    # Check if config.js exists
    if [ -f "config.js" ]; then
        echo -e "${GREEN}✓ config.js found${NC}"
    else
        echo -e "${RED}✗ config.js not found${NC}"
        exit 1
    fi
    
    # Basic HTML validation using Python
    python3 -c "
import html.parser
import sys

try:
    with open('index.html', 'r') as f:
        content = f.read()
        parser = html.parser.HTMLParser()
        parser.feed(content)
    print('✓ HTML validation passed')
except Exception as e:
    print(f'✗ HTML validation failed: {e}')
    sys.exit(1)
" || exit 1
    
    echo -e "${GREEN}✓ All tests passed${NC}"
fi

# Check git status
echo -e "\n${YELLOW}Checking git status...${NC}"
git status --short

# Run Goose recipe
echo -e "\n${YELLOW}Running Goose recipe...${NC}"

if [ -f "$RECIPE_PATH" ]; then
    echo "Using recipe: $RECIPE_PATH"
    
    # Run Goose in headless mode (--no-session for non-interactive)
    goose run --recipe "$RECIPE_PATH" \
        --params "commit_message=$COMMIT_MESSAGE" \
        --params "run_tests=$RUN_TESTS" \
        --no-session 2>&1 | tee goose-output.log
    
    GOOSE_EXIT_CODE=${PIPESTATUS[0]}
    
    if [ $GOOSE_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✓ Goose recipe executed successfully${NC}"
    else
        echo -e "${RED}✗ Goose recipe failed with exit code: $GOOSE_EXIT_CODE${NC}"
        exit $GOOSE_EXIT_CODE
    fi
else
    echo -e "${RED}Recipe not found: $RECIPE_PATH${NC}"
    echo "Creating a simple inline recipe..."
    
    # Run Goose with inline instructions
    goose run --text "
    Review the Proto GitHub Dashboard at index.html and:
    1. Check for any obvious issues or improvements
    2. Verify the configuration is correct
    3. Test that the dashboard loads properly
    4. If there are uncommitted changes, commit them with message: $COMMIT_MESSAGE
    5. Push changes to the repository
    " --no-session 2>&1 | tee goose-output.log
fi

# Check if there are changes to commit
echo -e "\n${YELLOW}Checking for uncommitted changes...${NC}"

if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}Found uncommitted changes:${NC}"
    git status --short
    
    read -p "Do you want to commit and push these changes? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add -A
        git commit -m "$COMMIT_MESSAGE" -m "Automated by Goose headless mode"
        
        echo -e "${YELLOW}Pushing to remote...${NC}"
        git push origin main
        
        echo -e "${GREEN}✓ Changes committed and pushed successfully${NC}"
    else
        echo -e "${YELLOW}Skipping commit${NC}"
    fi
else
    echo -e "${GREEN}No uncommitted changes found${NC}"
fi

# Summary
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}🪿 Goose Headless Mode Completed Successfully${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Output saved to: goose-output.log"
echo "Dashboard URL: file://$PWD/index.html"

# Open dashboard in browser (optional)
if command_exists open; then
    read -p "Open dashboard in browser? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "file://$PWD/index.html"
    fi
fi
