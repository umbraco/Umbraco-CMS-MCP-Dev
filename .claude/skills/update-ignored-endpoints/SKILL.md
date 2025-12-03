---
name: update-ignored-endpoints
description: Update the IGNORED_ENDPOINTS.md documentation file with current endpoint coverage analysis. Use when documentation needs to be refreshed or when verifying ignored endpoint status.
---

# Update Ignored Endpoints

This skill updates the IGNORED_ENDPOINTS.md file by analyzing which Umbraco Management API endpoints are intentionally not implemented as MCP tools.

## When to Use

Use this skill when:
- User asks to update the ignored endpoints documentation
- User wants to verify which endpoints are not implemented
- User needs to refresh the endpoint coverage analysis
- Changes have been made to tool implementations and documentation needs updating

## Instructions

1. Run the update script from the project root:

```bash
npx ts-node .claude/skills/update-ignored-endpoints/scripts/update-ignored-endpoints.ts
```

2. Review the changes to `/Users/philw/Projects/umbraco-mcp/docs/analysis/IGNORED_ENDPOINTS.md`

3. The script will:
   - Analyze all Umbraco Management API endpoints
   - Compare against implemented MCP tools
   - Update the documentation with current ignored endpoints
   - Preserve the rationale sections
   - Update the total count

## Supporting Files

The update script is available at [scripts/update-ignored-endpoints.ts](scripts/update-ignored-endpoints.ts) and analyzes the Umbraco Management API schema and existing MCP tools to generate updated documentation.
