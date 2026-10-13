---
root: false
targets:
  - '*'
description: General information about MCP
globs:
  - '**/*'
cursorRuleType: always
---

# MCP TypeScript SDK

This project uses the official `@modelcontextprotocol/sdk` TypeScript SDK. For the
SDK's concepts, quickstart, server/resource/tool/prompt APIs, transports (stdio,
Streamable HTTP), and advanced usage (low-level server, writing MCP clients, server
capabilities, proxy OAuth, backwards compatibility), refer to the upstream README
rather than a local copy that can drift out of date:

- https://github.com/modelcontextprotocol/typescript-sdk#readme

Project-specific MCP conventions (tool organization, Umbraco API integration,
resources/resource templates) live in `cursor-mcp.md` in this same directory.
