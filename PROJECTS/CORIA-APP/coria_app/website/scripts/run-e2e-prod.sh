#!/bin/bash
# E2E Smoke Tests on Production Build
#
# This script runs E2E smoke tests against a production build of the Next.js application.
# It handles the complete lifecycle: BUILD → START → TEST → CLEANUP
#
# Usage: npm run test:e2e:smoke:prod
#
# Exit codes:
#   0 - Tests passed successfully
#   1 - Tests failed
#   2 - Build failed
#   3 - Server failed to start

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PORT=3000
BASE_URL="http://localhost:${PORT}"
SERVER_PID_FILE="/tmp/next-prod-server.pid"
MAX_WAIT_TIME=60  # seconds to wait for server
HEALTH_CHECK_INTERVAL=2  # seconds between health checks

# Cleanup function - always runs on exit
cleanup() {
  local exit_code=$?

  echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"

  # Kill the production server if it's running
  if [ -f "$SERVER_PID_FILE" ]; then
    SERVER_PID=$(cat "$SERVER_PID_FILE")
    if ps -p "$SERVER_PID" > /dev/null 2>&1; then
      echo "  → Stopping production server (PID: $SERVER_PID)"
      kill "$SERVER_PID" 2>/dev/null || true
      # Wait a moment for graceful shutdown
      sleep 2
      # Force kill if still running
      if ps -p "$SERVER_PID" > /dev/null 2>&1; then
        kill -9 "$SERVER_PID" 2>/dev/null || true
      fi
    fi
    rm -f "$SERVER_PID_FILE"
  fi

  # Kill any remaining Next.js processes on port 3000
  lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

  echo -e "${GREEN}✅ Cleanup complete${NC}\n"
  exit $exit_code
}

# Register cleanup function
trap cleanup EXIT INT TERM

# Step 1: Build production bundle
echo -e "${BLUE}📦 Step 1/3: Building production bundle...${NC}"
if ! npm run build; then
  echo -e "${RED}❌ Build failed!${NC}"
  exit 2
fi
echo -e "${GREEN}✅ Production build complete${NC}\n"

# Step 2: Start production server
echo -e "${BLUE}🚀 Step 2/3: Starting production server on port ${PORT}...${NC}"

# Start server in background and store PID
npm start > /tmp/next-prod-server.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > "$SERVER_PID_FILE"

echo "  → Server PID: $SERVER_PID"
echo "  → Server log: /tmp/next-prod-server.log"

# Wait for server to be ready
echo -e "  → Waiting for server to be ready (max ${MAX_WAIT_TIME}s)..."

elapsed=0
while [ $elapsed -lt $MAX_WAIT_TIME ]; do
  # Check if server process is still running
  if ! ps -p "$SERVER_PID" > /dev/null 2>&1; then
    echo -e "${RED}❌ Server process died! Check /tmp/next-prod-server.log${NC}"
    tail -20 /tmp/next-prod-server.log
    exit 3
  fi

  # Try to connect to the server
  if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|301\|302\|307"; then
    echo -e "${GREEN}✅ Server is ready!${NC}\n"
    sleep 2  # Give it a moment to fully stabilize
    break
  fi

  # Show progress
  echo -n "."
  sleep $HEALTH_CHECK_INTERVAL
  elapsed=$((elapsed + HEALTH_CHECK_INTERVAL))
done

# Check if we timed out
if [ $elapsed -ge $MAX_WAIT_TIME ]; then
  echo -e "\n${RED}❌ Server failed to start within ${MAX_WAIT_TIME}s${NC}"
  echo -e "Last 20 lines of server log:"
  tail -20 /tmp/next-prod-server.log
  exit 3
fi

# Step 3: Run E2E smoke tests
echo -e "${BLUE}🎭 Step 3/3: Running E2E smoke tests...${NC}"
echo -e "  → Base URL: ${BASE_URL}"
echo -e "  → Test suite: Smoke tests (@smoke tag)\n"

# Run tests with BASE_URL environment variable
# Don't use set -e here so we can capture the exit code
set +e
BASE_URL="$BASE_URL" npx playwright test --grep @smoke
TEST_EXIT_CODE=$?
set -e

# Report results
echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ All smoke tests passed!${NC}"
else
  echo -e "${RED}❌ Some smoke tests failed (exit code: $TEST_EXIT_CODE)${NC}"
  echo -e "${YELLOW}📊 View detailed report: npx playwright show-report${NC}"
fi

# Exit with test exit code (cleanup function will run automatically)
exit $TEST_EXIT_CODE
