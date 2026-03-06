#!/bin/bash
# Start Cloudflare tunnels for local dev testing (e.g. ChatGPT)
#
# Tunnels:
#   - Umbraco (https://localhost:44391)
#   - Wrangler worker (http://localhost:8787)
#
# Automatically patches:
#   - .dev.vars (UMBRACO_BASE_URL for the worker)
#   - appsettings.local.json (MCP_TUNNEL_URL for OAuth redirect URI)
#
# After starting, restart Umbraco and the worker to pick up the new URLs.
#
# Usage: ./infrastructure/tunnels.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DEV_VARS="$PROJECT_DIR/.dev.vars"
APPSETTINGS="$SCRIPT_DIR/test-umbraco/MCPTestSite/appsettings.local.json"

UMBRACO_PORT="https://localhost:44391"
WORKER_PORT="http://localhost:8787"

UMBRACO_LOG=$(mktemp /tmp/tunnel-umbraco.XXXXXX)
WORKER_LOG=$(mktemp /tmp/tunnel-worker.XXXXXX)

cleanup() {
  echo ""
  echo "Shutting down tunnels..."
  kill $UMBRACO_PID $WORKER_PID 2>/dev/null
  rm -f "$UMBRACO_LOG" "$WORKER_LOG"
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "Starting Cloudflare tunnels..."
echo ""

# Start Umbraco tunnel (--no-tls-verify because of self-signed cert)
cloudflared tunnel --url "$UMBRACO_PORT" --no-tls-verify > "$UMBRACO_LOG" 2>&1 &
UMBRACO_PID=$!

# Start Worker tunnel
cloudflared tunnel --url "$WORKER_PORT" > "$WORKER_LOG" 2>&1 &
WORKER_PID=$!

# Wait for URLs to appear in logs
echo "Waiting for tunnel URLs..."
for i in $(seq 1 15); do
  UMBRACO_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$UMBRACO_LOG" 2>/dev/null | head -1)
  WORKER_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$WORKER_LOG" 2>/dev/null | head -1)
  if [ -n "$UMBRACO_URL" ] && [ -n "$WORKER_URL" ]; then
    break
  fi
  sleep 1
done

if [ -z "$UMBRACO_URL" ] || [ -z "$WORKER_URL" ]; then
  echo "ERROR: Timed out waiting for tunnel URLs"
  echo "  Umbraco log: $UMBRACO_LOG"
  echo "  Worker log:  $WORKER_LOG"
  cleanup
fi

# --- Patch .dev.vars ---
if [ -f "$DEV_VARS" ]; then
  # Update UMBRACO_BASE_URL (used for browser redirects to Umbraco)
  sed -i '' "s|^UMBRACO_BASE_URL=.*|UMBRACO_BASE_URL=$UMBRACO_URL|" "$DEV_VARS"
  # Keep UMBRACO_SERVER_URL pointing at localhost for server-to-server calls
  sed -i '' "s|^UMBRACO_SERVER_URL=.*|UMBRACO_SERVER_URL=http://localhost:56472|" "$DEV_VARS"
  echo "Patched .dev.vars"
  echo "  UMBRACO_BASE_URL=$UMBRACO_URL"
  echo "  UMBRACO_SERVER_URL=http://localhost:56472"
else
  echo "WARNING: $DEV_VARS not found, skipping"
fi

# --- Patch appsettings.local.json ---
# Add/update MCP_TUNNEL_URL so McpOAuthComposer registers the tunnel callback URI
if [ -f "$APPSETTINGS" ]; then
  if command -v python3 &>/dev/null; then
    python3 -c "
import json, sys
with open('$APPSETTINGS', 'r') as f:
    data = json.load(f)
data['MCP_TUNNEL_URL'] = '$WORKER_URL'
with open('$APPSETTINGS', 'w') as f:
    json.dump(data, f, indent=4)
"
    echo "Patched appsettings.local.json"
    echo "  MCP_TUNNEL_URL=$WORKER_URL"
  else
    echo "WARNING: python3 not found, cannot patch appsettings.local.json"
    echo "  Manually add: \"MCP_TUNNEL_URL\": \"$WORKER_URL\""
  fi
else
  echo "WARNING: $APPSETTINGS not found, skipping"
fi

echo ""
echo "========================================"
echo "  Cloudflare Tunnels"
echo "========================================"
echo ""
echo "  Umbraco:  $UMBRACO_URL"
echo "  Worker:   $WORKER_URL"
echo ""
echo "  MCP Server URL (for ChatGPT, Claude, etc.):"
echo "    $WORKER_URL/"
echo ""
echo "  Next steps:"
echo "    1. Restart Umbraco (to register tunnel callback URI)"
echo "    2. Restart worker  (npm run dev:worker)"
echo ""
echo "  Press Ctrl+C to stop"
echo "========================================"

wait
