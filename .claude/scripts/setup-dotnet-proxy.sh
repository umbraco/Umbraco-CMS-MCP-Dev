#!/bin/bash
# Setup proxy for .NET/NuGet in Claude Code web environment
# This script detects if we're in the Claude Code web environment and sets up
# px-proxy to handle the JWT-authenticated proxy for .NET tools.

set -e

# Check if we're in Claude Code web environment (look for JWT proxy pattern)
if [[ "$HTTP_PROXY" =~ "jwt_" ]] && [[ "$HTTP_PROXY" =~ "@" ]]; then
    echo "Detected Claude Code web environment with JWT proxy"

    # Check if px-proxy is already running
    if pgrep -f "px.*--port=3128" > /dev/null 2>&1; then
        echo "px-proxy already running on port 3128"
        export http_proxy="http://127.0.0.1:3128"
        export https_proxy="http://127.0.0.1:3128"
        export HTTP_PROXY="http://127.0.0.1:3128"
        export HTTPS_PROXY="http://127.0.0.1:3128"
        # Don't exit - let the script continue (important when sourced)
        return 0 2>/dev/null || true
    fi

    # Check if px-proxy is installed
    if ! command -v px &> /dev/null; then
        echo "Installing px-proxy..."
        pip install --quiet px-proxy 2>/dev/null || pip install --quiet --user px-proxy 2>/dev/null
    fi

    # Extract upstream proxy details
    PROXY_URL="$HTTP_PROXY"
    UPSTREAM_HOST=$(echo "$PROXY_URL" | sed -E 's|http://([^:]+:[^@]+@)?([^/]+).*|\2|')
    CREDS=$(echo "$PROXY_URL" | sed -E 's|http://([^@]+)@.*|\1|')
    UPSTREAM_USER=$(echo "$CREDS" | cut -d: -f1)
    UPSTREAM_PASS=$(echo "$CREDS" | cut -d: -f2-)

    echo "Starting px-proxy for upstream: $UPSTREAM_HOST"

    # Start px-proxy in background
    export PX_PASSWORD="$UPSTREAM_PASS"
    nohup px --server="$UPSTREAM_HOST" --username="$UPSTREAM_USER" --auth=BASIC --port=3128 > /tmp/px-proxy.log 2>&1 &

    # Wait for px-proxy to start
    sleep 2

    # Verify px-proxy is running
    if pgrep -f "px.*--port=3128" > /dev/null 2>&1; then
        echo "px-proxy started successfully"

        # Export local proxy for .NET
        export http_proxy="http://127.0.0.1:3128"
        export https_proxy="http://127.0.0.1:3128"
        export HTTP_PROXY="http://127.0.0.1:3128"
        export HTTPS_PROXY="http://127.0.0.1:3128"

        echo "Proxy environment configured for .NET"
    else
        echo "Warning: px-proxy failed to start. Check /tmp/px-proxy.log"
        return 1 2>/dev/null || exit 1
    fi
else
    echo "Not in Claude Code web environment - no proxy setup needed"
fi

# Return success (for sourcing)
return 0 2>/dev/null || true
