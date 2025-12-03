---
name: count-mcp-tools
description: Count the total number of MCP tools in the Umbraco MCP Server project and provide a breakdown by collection. Use when the user asks about tool counts, tool statistics, or how many tools exist.
---

# Count MCP Tools

This skill counts all MCP tools in the project and provides a detailed breakdown by collection.

## When to Use

Use this skill when:
- User asks "how many tools do we have?"
- User wants statistics about tool collections
- User needs to know tool distribution across collections
- User asks about project size or coverage

## Instructions

1. Run the counting script from the project root:

```bash
TOOLS_DIR=src/umb-management-api/tools OUTPUT_FILE=docs/analysis/api-endpoints-analysis.md npx ts-node .claude/skills/count-mcp-tools/scripts/count-tools.ts
```

Or without saving to file:

```bash
TOOLS_DIR=src/umb-management-api/tools npx ts-node .claude/skills/count-mcp-tools/scripts/count-tools.ts
```

To also show all tool names in the console output:

```bash
TOOLS_DIR=src/umb-management-api/tools SHOW_TOOLS=true npx ts-node .claude/skills/count-mcp-tools/scripts/count-tools.ts
```

2. Present results showing:
   - Total tool count
   - Breakdown by collection (sorted alphabetically)
   - List of individual tool names per collection (when SHOW_TOOLS=true or in markdown output)
   - Highlight the largest collections (top 5-8)
   - If OUTPUT_FILE is set, saves to markdown file with full tool listing

## Environment Variables

| Variable | Description |
|----------|-------------|
| `TOOLS_DIR` | Path to the tools directory (default: `.`) |
| `OUTPUT_FILE` | Optional path to save markdown analysis report |
| `SHOW_TOOLS` | Set to `true` to show individual tool names in console output |

## Supporting Files

The counting script is available at [scripts/count-tools.ts](scripts/count-tools.ts) and counts TypeScript files that define actual MCP tools (containing `CreateUmbracoTool` or `CreateUmbracoResource`), excluding `index.ts`, test files, and helper/utility files.
