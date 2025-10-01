# /analyze-coverage

Regenerates the Umbraco MCP endpoint coverage analysis report by comparing implemented tools against the full API endpoint list.

## Usage
```
/analyze-coverage
```

## Description
This command analyzes the current state of MCP tool implementation and generates a comprehensive coverage report showing:
- Overall coverage statistics
- Coverage breakdown by API group
- Missing endpoints for each group
- Priority recommendations for implementation
- Quick wins (nearly complete sections)

## Steps Performed
1. **Regenerate API endpoint list** from the Orval-generated Umbraco client
   - Parse `src/api/umbraco/client.ts` to extract all API methods
   - Group endpoints by API category/tag from the OpenAPI spec
   - Update `docs/analysis/api-endpoints-analysis.md` with the complete endpoint list
2. Scan all implemented MCP tools in `src/umb-management-api/tools/`
3. Match implemented tools against API endpoints
4. Calculate coverage percentages per API group
5. Generate formatted report with statistics and recommendations
6. Save report to `docs/analysis/UNSUPPORTED_ENDPOINTS.md`

## Output
The command updates the `UNSUPPORTED_ENDPOINTS.md` file with:
- Total endpoint count and coverage percentage
- Alphabetically organized API groups with coverage status
- List of missing endpoints for incomplete groups
- Priority recommendations for implementation
- Quick wins section highlighting nearly complete groups

## Example Output
```
🔍 Analyzing Umbraco MCP endpoint coverage...
📖 Parsing API endpoints from documentation...
   Found 37 API groups
🔧 Scanning implemented MCP tools...
   Found 269 implementations
📊 Calculating coverage statistics...
📝 Generating coverage report...
✅ Coverage report generated successfully!
   Output: docs/analysis/UNSUPPORTED_ENDPOINTS.md

📈 Summary:
   Total Endpoints: 393
   Implemented: 269
   Coverage: 68%
   Missing: 124
```

## Notes
- The command uses the `api-endpoints-analysis.md` as the source of truth for available endpoints
- Coverage is calculated by matching tool implementations against endpoint names
- The report is organized alphabetically by API group for easy navigation
- Status indicators: ✅ Complete (100%), ⚠️ Nearly Complete (80%+), ❌ Not Implemented (0%)