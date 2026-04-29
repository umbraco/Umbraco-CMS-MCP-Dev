---
name: umb-cms-dev-cli
description: Guide for running and debugging this Umbraco MCP server via the CLI. Use when the user wants to list tools, call tools, configure filtering, dry-run, readonly mode, or debug configuration.
---

# Umbraco MCP Server — CLI Guide

This MCP server runs as a CLI tool. The CLI handles authentication and configuration, then exposes tools that talk directly to the Umbraco Management API.

## Detecting the CLI Command

Determine the CLI command in a single check:

```bash
# One command to detect context — check for local build AND .env together
ls dist/index.js .env 2>/dev/null
```

- If `dist/index.js` exists: use `node dist/index.js`
- Otherwise: use `npx @umbraco-cms/mcp-dev@latest`

All examples below use `<cli>` as a placeholder — substitute the correct command.

## Quick Reference

```bash
# List all tools
<cli> --list-tools

# Describe a specific tool's schema
<cli> --describe-tool <tool-name>

# Call a tool directly (requires auth via .env)
<cli> --call <tool-name> --call-args '{"key":"value"}'

# Generate context documentation
<cli> --generate-context > CONTEXT.md

# Debug resolved configuration
<cli> --debug-config
```

## Authentication

**Never pass secrets as CLI arguments.** Use a `.env` file.

| Env Var | Required | Description |
|---------|----------|-------------|
| `UMBRACO_CLIENT_ID` | Yes | OAuth client ID from Umbraco API user |
| `UMBRACO_CLIENT_SECRET` | Yes | OAuth client secret |
| `UMBRACO_BASE_URL` | Yes | Umbraco instance URL |

Create a `.env` file:
```
UMBRACO_CLIENT_ID=your-client-id
UMBRACO_CLIENT_SECRET=your-secret
UMBRACO_BASE_URL=https://localhost:44391
```

Introspection commands (`--list-tools`, `--describe-tool`, `--generate-context`) do not require auth.

## Tool Filtering

| Flag | Env Var | Description |
|------|---------|-------------|
| `--umbraco-tool-modes` | `UMBRACO_TOOL_MODES` | Enable named groups of collections |
| `--umbraco-include-slices` | `UMBRACO_INCLUDE_SLICES` | Only expose tools with these slices |
| `--umbraco-exclude-slices` | `UMBRACO_EXCLUDE_SLICES` | Hide tools with these slices |
| `--umbraco-include-tool-collections` | `UMBRACO_INCLUDE_TOOL_COLLECTIONS` | Only expose these collections |
| `--umbraco-exclude-tool-collections` | `UMBRACO_EXCLUDE_TOOL_COLLECTIONS` | Hide these collections |
| `--umbraco-include-tools` | `UMBRACO_INCLUDE_TOOLS` | Only expose these specific tools |
| `--umbraco-exclude-tools` | `UMBRACO_EXCLUDE_TOOLS` | Hide these specific tools |

Available slices: `read`, `list`, `create`, `update`, `delete`, `search`, `tree`, `publish`, `move`, `copy`.

Exclude takes precedence over include. Filters combine.

## Runtime Modes

### Readonly mode
```bash
<cli> --umbraco-readonly
```
Mutation tools are completely removed — the LLM won't see them at all.

### Dry-run mode
```bash
<cli> --umbraco-dry-run
```
Read tools execute normally. Mutation tools return a preview without calling the API.

## Introspection Commands

These print output and exit immediately — they do not start the MCP server.

| Flag | Description |
|------|-------------|
| `--list-tools` | Print ASCII table of all tools |
| `--describe-tool <name>` | Print full JSON schema for a tool |
| `--generate-context` | Output CONTEXT.md documenting all tools |
| `--debug-config` | Print resolved config (secrets masked) |
| `--call <name>` | Call a tool directly, print JSON result |
| `--call-args <json>` | JSON arguments for `--call` (default: `{}`) |

Introspection respects all filtering. `--list-tools` with `UMBRACO_READONLY=true` shows exactly what the LLM would see.

## Efficient CLI Usage

Every CLI call costs time and tokens. The CLI has built-in filtering so you don't need to fetch everything and grep locally. Follow these principles:

**1. Filter server-side, not locally.** Instead of `--list-tools | grep document`, use the filtering flags:
```bash
# Bad — fetches all tools then filters locally
<cli> --list-tools | grep document

# Good — server returns only what you need
<cli> --list-tools --umbraco-include-tool-collections document
```

You can combine filters to narrow further:
```bash
<cli> --list-tools --umbraco-include-tool-collections document --umbraco-include-slices read,search
```

**2. Use search tools before tree traversal.** When looking for a specific item by name, prefer `search-document` over walking the tree with `get-document-root` → `get-document-by-id`. Search is one call instead of two.

**3. Batch independent shell commands.** Combine checks that don't depend on each other:
```bash
# Bad — two separate calls
ls dist/index.js
ls .env

# Good — one call
ls dist/index.js .env 2>/dev/null
```

**4. Use `--describe-tool` before guessing parameters.** If you're unsure what a tool accepts, describe it first rather than making a call that might fail.

For more workflow examples, read `references/workflow-patterns.md`.

## Input Sanitization

The SDK validates all string inputs before tool handlers run:
- Rejects control characters, path traversal (`../`), embedded query params, percent-encoded strings
- Validates UUID format where expected
- Returns clear error messages for agent self-correction
