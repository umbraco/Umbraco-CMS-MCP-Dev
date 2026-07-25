---
name: umb-cms-mcp-setup
description: Guide for installing and configuring the Umbraco MCP server (@umbraco-cms/mcp-dev) as a live MCP connection in an AI client. Use when the user wants to set up, connect, install, or troubleshoot the MCP server itself (as opposed to running it standalone via the CLI).
---

# Umbraco MCP Server — Setup Guide

This covers running `@umbraco-cms/mcp-dev` as a live MCP server connected to an AI client (Claude Desktop, Claude Code, Cursor, VS Code, etc). For debugging the package directly on the command line (`--list-tools`, `--call`, `--debug-config`), see the `umb-cms-dev-cli` skill instead — the same env vars apply either way.

## Prerequisites

- An Umbraco CMS instance the client can reach over HTTPS (or HTTP on a local network).
- Node.js 22 or later (the package's declared `engines.node` requirement) if the client itself needs to run `npx` — most desktop clients bundle their own Node runtime, so this mainly matters if you're invoking the server manually.
- An Umbraco API user with the permissions you want the agent to have.

## 1. Create an Umbraco API User

The server authenticates as an Umbraco **API user** — a permission-scoped OAuth client, not an admin login. Whatever permissions you grant that user become the ceiling on what the agent can do.

Create one following [Umbraco's API user documentation](https://docs.umbraco.com/umbraco-cms/fundamentals/data/users/api-users). You'll come away with a **client ID** and **client secret** — treat the secret like a password (never commit it, never paste it into chat).

## 2. Configure the Server in Your MCP Client

The server is distributed as an npm package and run via `npx`. Every client ultimately needs the same three pieces of information: a command to launch the server, and the auth env vars from the table below.

### Claude Desktop

Open Settings > Developer > Edit Config, and add this to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "umbraco-mcp": {
      "command": "npx",
      "args": ["@umbraco-cms/mcp-dev@17"],
      "env": {
        "NODE_TLS_REJECT_UNAUTHORIZED": "0",
        "UMBRACO_CLIENT_ID": "your-api-user-id",
        "UMBRACO_CLIENT_SECRET": "your-api-secret",
        "UMBRACO_BASE_URL": "https://localhost:{port}",
        "UMBRACO_INCLUDE_TOOL_COLLECTIONS": "document,media,document-type,data-type"
      }
    }
  }
}
```

Then fully restart Claude Desktop (on Windows, also quit it from the system tray — closing the window alone isn't enough).

### Claude Code

Add the server with `claude mcp add`, passing each env var with a separate `-e` flag before the `--`:

```bash
claude mcp add umbraco-mcp \
  -e UMBRACO_CLIENT_ID=your-api-user-id \
  -e UMBRACO_CLIENT_SECRET=your-api-secret \
  -e UMBRACO_BASE_URL=https://localhost:{port} \
  -e NODE_TLS_REJECT_UNAUTHORIZED=0 \
  -- npx @umbraco-cms/mcp-dev@17
```

Use `claude mcp list` / `claude mcp get umbraco-mcp` afterwards to confirm the entry, or to edit it later.

### Cursor / VS Code / other MCP clients

Both Cursor and VS Code's Copilot Chat support MCP servers configured through a JSON block that is structurally the same as Claude Desktop's (`command` / `args` / `env`) — check that client's current MCP docs for the exact file location and key name (Cursor uses `mcp.json`; VS Code uses `mcp.json` or the `mcp` key in `settings.json` depending on version), since these move independently of this repo. Reuse the `command`, `args`, and `env` values from the Claude Desktop example above once you've found the right file.

## 3. Required and Optional Environment Variables

| Env Var | Required | Description |
|---------|----------|--------------|
| `UMBRACO_CLIENT_ID` | Yes | OAuth client ID from the Umbraco API user |
| `UMBRACO_CLIENT_SECRET` | Yes | OAuth client secret — keep this out of chat, source control, and screenshots |
| `UMBRACO_BASE_URL` | Yes | Base URL of the Umbraco instance, e.g. `https://localhost:44391` |
| `NODE_TLS_REJECT_UNAUTHORIZED` | No | Set to `0` only for local instances with self-signed certs. Never set this for a production/public base URL. |
| `UMBRACO_INCLUDE_TOOL_COLLECTIONS` | No | Comma-separated collections to expose (e.g. `document,media`) — narrows the toolset the client loads |
| `UMBRACO_READONLY` | No | `true` removes all mutation tools — the LLM never sees them |
| `UMBRACO_DRY_RUN` | No | `true` lets mutation tools run and return a preview without calling the API |

These are the same filtering and mode env vars the CLI supports (`UMBRACO_TOOL_MODES`, `UMBRACO_INCLUDE_SLICES`, `UMBRACO_EXCLUDE_SLICES`, `UMBRACO_INCLUDE_TOOLS`, `UMBRACO_EXCLUDE_TOOLS`, `UMBRACO_ALLOWED_MEDIA_PATHS`, etc.) — see the `umb-cms-dev-cli` skill's Tool Filtering and Runtime Modes tables for the full reference rather than duplicating it here.

## 4. Restart the Client

MCP clients read server config once at startup. After adding or editing the config, fully restart the client (not just reload a window) before it will pick up the new server.

## 5. Verify It Worked

Once restarted, confirm the connection from inside a conversation:

- Ask the assistant something like "list the Umbraco MCP tools available to you" or "what Umbraco tools do you have?" — it should enumerate tools (e.g. `get-document-by-id`, `search-document`) rather than saying it has no such tools.
- Ask it to run a harmless read-only call, e.g. "get the Umbraco server status" — a successful response confirms auth is working end to end.
- Check the client's MCP/server logs if it has one (Claude Desktop: Settings > Developer shows connected servers and their status; `claude mcp list` for Claude Code) to confirm the server started without errors.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Client shows the server as failed/disconnected immediately | Bad JSON in the config file | Validate the JSON; a trailing comma or missing brace will silently break the whole config block |
| Auth error / 401 on every tool call | Wrong or revoked `UMBRACO_CLIENT_ID` / `UMBRACO_CLIENT_SECRET` | Re-check the API user in the Umbraco backoffice; regenerate credentials if needed |
| `unable to verify the first certificate` or similar TLS error | Local instance using a self-signed cert | Set `NODE_TLS_REJECT_UNAUTHORIZED=0` for that local connection only — never for a real/public URL |
| Connection refused / timeout | `UMBRACO_BASE_URL` has the wrong host or port, or Umbraco isn't running | Confirm the instance is up and reachable at that exact URL from the machine running the client |
| No tools show up, or fewer than expected | `UMBRACO_INCLUDE_TOOL_COLLECTIONS` (or another filtering var) is scoping the toolset down | Remove the filter temporarily to confirm, then re-narrow deliberately — see the CLI skill's filtering tables |
| Config edits don't seem to take effect | Client only reads config at startup | Fully quit and restart the client (including from the system tray on Windows) |
| Mutation tools missing entirely | `UMBRACO_READONLY=true` is set | Expected behavior — unset it if the agent needs to make changes |
