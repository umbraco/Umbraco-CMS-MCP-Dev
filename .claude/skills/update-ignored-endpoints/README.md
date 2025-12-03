# Update Ignored Endpoints Skill

This skill automatically updates the `docs/analysis/IGNORED_ENDPOINTS.md` file by analyzing the Umbraco Management API and comparing it against implemented MCP tools.

## What It Does

The skill:
1. Extracts all API endpoints from the generated Umbraco Management API TypeScript client
2. Scans the tools directory to identify which endpoints have MCP tool implementations
3. Categorizes ignored (unimplemented) endpoints by their API group
4. Generates an updated IGNORED_ENDPOINTS.md file with current coverage statistics
5. Preserves existing rationale sections from the documentation

## How It Works

The TypeScript script analyzes:
- **API Endpoints**: Extracted from `src/umb-management-api/api/api/umbracoManagementAPI.ts` by finding all Result type exports
- **Implemented Tools**: Scanned from `src/umb-management-api/tools/` by finding CreateUmbracoTool calls and their corresponding API client method calls
- **Categorization**: Groups ignored endpoints by common patterns (User, Security, Package, etc.)

## Usage

From the project root, run:

```bash
npx ts-node .claude/skills/update-ignored-endpoints/scripts/update-ignored-endpoints.ts
```

Or use the skill through Claude Code:
```
Can you update the ignored endpoints documentation?
```

## Output

The script outputs:
- Updated `docs/analysis/IGNORED_ENDPOINTS.md` file
- Console summary showing:
  - Total API endpoints discovered
  - Number of implemented endpoints
  - Number of ignored endpoints
  - API coverage percentage

## Example Output

```
✅ IGNORED_ENDPOINTS.md has been updated successfully!

Summary:
  Total API endpoints: 401
  Implemented (unique endpoints): 323
  Ignored: 82
  Coverage: 80.5%

Note: 334 MCP tools implement 323 unique API endpoints
      Some tools use multiple endpoints, and some endpoints are used by multiple tools.
```

## Understanding the Numbers

**Why do tool count and endpoint count differ?**

- `count-mcp-tools`: **334 MCP tools** (files with CreateUmbracoTool or CreateUmbracoResource)
- `update-ignored-endpoints`: **323 unique API endpoints** being called by those tools

The difference (334 tools vs 323 endpoints) exists because:
1. Some tools use **multiple API endpoints** (e.g., publish-document-with-descendants calls 2 endpoints)
2. Some endpoints are **used by multiple tools** (e.g., deleteDocumentById is called from different contexts)

Both numbers are accurate - they measure different aspects:
- **334 tools** = MCP tools exposed to LLMs
- **323 endpoints** = Unique Umbraco API endpoints utilized
- **401 total** = All available Umbraco Management API endpoints
- **80.5% coverage** = Percentage of API endpoints with tool implementations

## Customization

You can customize the script behavior by setting environment variables:

- `PROJECT_ROOT`: Override the project root directory (default: `/Users/philw/Projects/umbraco-mcp`)

Example:
```bash
PROJECT_ROOT=/path/to/project npx ts-node .claude/skills/update-ignored-endpoints/scripts/update-ignored-endpoints.ts
```

## Implementation Details

- Written in TypeScript for type safety and consistency with the project
- Uses the `glob` package for efficient file pattern matching
- Preserves the "## Rationale" section from existing documentation
- Endpoints are automatically categorized based on naming patterns
- Uses regex matching to find API endpoints and tool implementations
- Coverage statistics help track progress toward complete API implementation
