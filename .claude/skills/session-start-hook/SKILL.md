---
name: session-start-hook
description: Creating and developing startup hooks for Claude Code on the web. Use when the user wants to set up a repository for Claude Code on the web, create a SessionStart hook to ensure their project can run tests and linters during web sessions.
---

# Session Start Hook for .NET Proxy Setup

This skill configures Claude Code to automatically handle .NET/NuGet proxy authentication when running in the Claude Code web environment.

## Problem

Claude Code web runs in a containerized environment that requires JWT-authenticated proxies for external network access. While tools like `curl`, `npm`, and `wget` work correctly with this proxy, .NET's HttpClient doesn't properly handle the JWT authentication format, causing `dotnet restore` and `dotnet build` to fail with 401 errors.

## Solution

We use `px-proxy` as an intermediary proxy that:
1. Accepts unauthenticated connections locally (port 3128)
2. Forwards requests to the upstream proxy with proper JWT authentication
3. Allows .NET to work normally by pointing it at the local proxy

## Files

### `.claude/scripts/setup-dotnet-proxy.sh`

This script:
1. Detects if running in Claude Code web environment (checks for JWT in proxy URL)
2. Installs `px-proxy` if not present
3. Starts px-proxy on port 3128 with upstream auth
4. Exports proxy environment variables for .NET

### `.claude/settings.json`

Configures the SessionStart hook to run the setup script when a Claude Code session begins.

## Manual Usage

If the hook doesn't run automatically, you can manually set up the proxy:

```bash
# Source the setup script
source .claude/scripts/setup-dotnet-proxy.sh

# Then run dotnet commands
dotnet restore
dotnet build
```

Or run dotnet with explicit proxy:

```bash
# Start px-proxy manually
pip install px-proxy
export PX_PASSWORD="<jwt_token_from_HTTP_PROXY>"
px --server="<proxy_host:port>" --username="<container_id>" --auth=BASIC --port=3128 &

# Use local proxy for dotnet
export http_proxy="http://127.0.0.1:3128"
export https_proxy="http://127.0.0.1:3128"
dotnet restore
```

## Local Development

When running locally (not in Claude Code web), the script detects that no JWT proxy is configured and skips the setup entirely. This means:
- Local development works normally without any proxy
- The script is safe to run in any environment
- No changes needed for local vs web development

## Troubleshooting

### px-proxy fails to start

Check the log file:
```bash
cat /tmp/px-proxy.log
```

### Still getting 401 errors

Verify px-proxy is running:
```bash
pgrep -f "px.*--port=3128"
```

Verify the proxy works with curl:
```bash
curl --proxy http://127.0.0.1:3128 -I https://api.nuget.org/v3/index.json
```

### JWT token expired

The JWT token in the proxy URL has an expiration time. If you see authentication failures after a long session, the token may have expired. Start a new Claude Code session to get a fresh token.
