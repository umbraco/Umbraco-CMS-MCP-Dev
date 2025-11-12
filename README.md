# Umbraco MCP ![GitHub License](https://img.shields.io/github/license/umbraco/Umbraco-CMS-MCP-Dev?style=plastic&link=https%3A%2F%2Fgithub.com%2Fumbraco%2FUmbraco-CMS-MCP-Dev%2Fblob%2Fmain%2FLICENSE)

An MCP (Model Context Protocol) server for [Umbraco CMS](https://umbraco.com/)
it provides developer access to the majority of the Management API enabling you to complete most back office tasks with your agent that you can accomplish using the UI.

## Intro

The MCP server uses an Umbraco API user to access your Umbraco Management API, mean the tools available to the AI can be controlled using normal Umbraco user permissions.

## Quick Start

### 1. Create an Umbraco API User

First, create an Umbraco API user with appropriate permissions. You can find instructions in [Umbraco's documentation](https://docs.umbraco.com/umbraco-cms/fundamentals/data/users/api-users).

### 2. Install in Claude Desktop

Download and install the [Claude Desktop app](https://claude.ai/download), then add the MCP server to your configuration:

1. Open Claude Desktop Settings > Developer > Edit Config
2. Add this configuration to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "umbraco-mcp": {
      "command": "npx",
      "args": ["@umbraco-cms/mcp-dev@beta"],
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

3. Fully restart Claude Desktop

## Documentation

For complete installation instructions, configuration options, tool listings, and usage examples, see the full documentation:

**[Umbraco MCP Documentation](https://docs.umbraco.com/umbraco-cms/reference/developer-mcp)**

## Contributing with AI Tools

This project is optimized for development with AI coding assistants. We provide instruction files for popular AI tools to help maintain consistency with our established patterns and testing standards.

### Using rulesync

The project includes rulesync configuration files that can automatically generate instruction files for 19+ AI development tools. Generate configuration files for your preferred AI tools:

```bash
# Generate only for Claude Code
npx rulesync generate --claudecode

# Generate only for Cursor
npx rulesync generate --cursor

# Generate only for Vs Code Copilot
npx rulesync generate --copilot
```

### Other AI Tools

rulesync supports 19+ AI development tools including GitHub Copilot, Cline, Aider, and more. Check the [rulesync repository](https://github.com/dyoshikawa/rulesync) for the complete list of supported tools.

The instruction files cover:
- MCP development patterns and conventions
- TypeScript implementation guidelines
- Comprehensive testing standards with builders and helpers
- Project-specific context and architecture
- API integration patterns with Umbraco Management API
