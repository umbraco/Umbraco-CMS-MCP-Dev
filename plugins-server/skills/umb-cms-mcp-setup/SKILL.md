---
name: umb-cms-mcp-setup
description: Guide for installing and configuring the Umbraco MCP server (@umbraco-cms/mcp-dev) as a live MCP connection in an AI client. Use when the user wants to set up, connect, install, or troubleshoot the MCP server itself (as opposed to running it standalone via the CLI).
---

# Umbraco MCP Server — Setup Guide

This covers running `@umbraco-cms/mcp-dev` as a live MCP server connected to an AI client (Claude Desktop, Claude Code, Cursor, VS Code, etc). For debugging the package directly on the command line (`--list-tools`, `--call`, `--debug-config`), see the `umb-cms-dev-cli` skill instead — the same env vars apply either way.

For install steps, verifying the connection, and troubleshooting, use the official docs rather than this skill — they're the source of truth and won't drift out of sync the way a duplicated copy here would:

**[Umbraco MCP Documentation](https://docs.umbraco.com/umbraco-in-ai/mcp/cms-developer-mcp)**

For per-client configuration, go straight to the guide for the client actually in use rather than the general page above:

- [Claude Desktop](https://docs.umbraco.com/umbraco-in-ai/17.latest/mcp/local-mcp-setup/claude-desktop)
- [Claude Code](https://docs.umbraco.com/umbraco-in-ai/17.latest/mcp/local-mcp-setup/claude-code)
- [Cursor](https://docs.umbraco.com/umbraco-in-ai/17.latest/mcp/local-mcp-setup/cursor)
- [GitHub Copilot](https://docs.umbraco.com/umbraco-in-ai/17.latest/mcp/local-mcp-setup/github-copilot)
- [OpenAI Codex](https://docs.umbraco.com/umbraco-in-ai/17.latest/mcp/local-mcp-setup/openai-codex)

## Prerequisites

- An Umbraco CMS instance the client can reach over HTTPS (or HTTP on a local network).
- Node.js 22 or later (the package's declared `engines.node` requirement) if the client itself needs to run `npx` — most desktop clients bundle their own Node runtime, so this mainly matters if you're invoking the server manually.
- An Umbraco API user with the permissions you want the agent to have — see [Umbraco's API user documentation](https://docs.umbraco.com/umbraco-cms/fundamentals/data/users/api-users). You'll come away with a **client ID** and **client secret**; treat the secret like a password (never commit it, never paste it into chat).

## Coding Environments: `.mcp.json`

When the client is a coding agent working against a project (Claude Code, Cursor, VS Code, etc.), the preferred setup is a project-scoped MCP config file — e.g. `.mcp.json` for Claude Code — rather than a global/user-level config, so the server definition can be checked in and shared across the team without each developer's real secrets:

```json
{
  "mcpServers": {
    "umbraco-mcp": {
      "command": "npx",
      "args": ["@umbraco-cms/mcp-dev@latest"],
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

Keep real `UMBRACO_CLIENT_ID` / `UMBRACO_CLIENT_SECRET` values out of any file that gets committed — use a local, git-ignored env file or your client's secret-reference mechanism instead of hardcoding them in a checked-in `.mcp.json`.

Don't assume the `@latest` tag above for every project — the dist-tag depends on the target site's Umbraco major version. The two you'll hit most often:

- **`@latest`** — Umbraco 18.x (current release)
- **`@lts-17`** — Umbraco 17.x (current LTS)

For anything older (`@16` for 16.x, `@alpha` for the pre-16 package) or to confirm this mapping is still current, check the docs' [Version Compatibility table](https://docs.umbraco.com/umbraco-in-ai/mcp/cms-developer-mcp).

## Required and Optional Environment Variables

| Env Var | Required | Description |
|---------|----------|--------------|
| `UMBRACO_CLIENT_ID` | Yes | OAuth client ID from the Umbraco API user |
| `UMBRACO_CLIENT_SECRET` | Yes | OAuth client secret — keep this out of chat, source control, and screenshots |
| `UMBRACO_BASE_URL` | Yes | Base URL of the Umbraco instance, e.g. `https://localhost:44391` |
| `NODE_TLS_REJECT_UNAUTHORIZED` | No | Set to `0` only for local instances with self-signed certs. Never set this for a production/public base URL. |
| `UMBRACO_INCLUDE_TOOL_COLLECTIONS` | No | Comma-separated collections to expose (e.g. `document,media`) — narrows the toolset the client loads |
| `UMBRACO_READONLY` | No | `true` removes all mutation tools — the LLM never sees them |
| `UMBRACO_DRY_RUN` | No | `true` lets mutation tools run and return a preview without calling the API |
| `UMBRACO_TOOL_MODES` | No | Comma-separated named modes — presets that enable a curated set of collections (see below) |
| `UMBRACO_INCLUDE_SLICES` | No | Comma-separated slices — only expose tools whose operation kind matches (see below) |
| `UMBRACO_EXCLUDE_SLICES` | No | Comma-separated slices to hide — takes precedence over `UMBRACO_INCLUDE_SLICES` |

## Slices and Modes

Beyond collections (`document`, `media`, etc.), the server supports two more ways to shape which tools a client sees:

**A slice is the operation kind a tool performs** (its verb), independent of which collection it belongs to. Every tool is tagged with one or more slices, so slice filtering cuts across collections — e.g. `UMBRACO_INCLUDE_SLICES=read,search` exposes only read/search tools across every enabled collection. Available slices (from `src/config/slice-registry.ts`, the source of truth): `create`, `read`, `update`, `delete`, `tree`, `folders`, `search`, `list`, `references`, `publish`, `recycle-bin`, `move`, `copy`, `sort`, `validate`, `rename`, `configuration`, `audit`, `urls`, `domains`, `permissions`, `user-status`, `current-user`, `notifications`, `public-access`, `scaffolding`, `blueprints`, `server-info`, `diagnostics`, `templates` — plus `other` as a catch-all for tools with no slices assigned.

**A mode is a named preset that maps to a fixed set of collections** — a shortcut for "give me everything related to X" instead of listing collections by hand via `UMBRACO_INCLUDE_TOOL_COLLECTIONS`. Set `UMBRACO_TOOL_MODES` to a comma-separated list to enable more than one. Current modes (from `src/config/mode-registry.ts`):

| Mode | Description |
|------|-------------|
| `content` | Document creation, editing, versioning, and blueprints |
| `content-modeling` | Document and media structure: types, data types, and content to see the output |
| `front-end` | Templates, partial views, stylesheets, scripts, and static files |
| `media` | Media library, imaging operations, and file uploads |
| `search` | Examine indexes and search functionality |
| `users` | Back office users, user groups, and user data |
| `members` | Front-end members, member types, and member groups |
| `health` | Health checks and log viewer |
| `translation` | Cultures, languages, and dictionary items |
| `system` | Server information, manifest, and models builder |
| `integrations` | Webhooks, redirects, relations, and tags |

Modes, slices, and the collection/tool include-exclude filters all combine (exclude always wins over include) — e.g. `UMBRACO_TOOL_MODES=content` plus `UMBRACO_EXCLUDE_SLICES=delete` exposes every content-management tool except deletions.

For the CLI flag equivalents of these same env vars (`--umbraco-tool-modes`, `--umbraco-include-slices`, etc.) and the remaining filtering env vars (`UMBRACO_INCLUDE_TOOLS`, `UMBRACO_EXCLUDE_TOOLS`, `UMBRACO_ALLOWED_MEDIA_PATHS`, etc.), see the `umb-cms-dev-cli` skill's Tool Filtering and Runtime Modes tables rather than duplicating them here.
