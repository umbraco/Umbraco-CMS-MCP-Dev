# Create Integration Tests Skill

This skill provides comprehensive guidance for creating integration tests for MCP tools in the Umbraco MCP Server project.

## Usage

Invoke this skill when you need to:
- Create new integration tests for MCP tools
- Add tests to existing tool collections
- Review test patterns for consistency
- Understand the test infrastructure

## Key Patterns Documented

The skill covers:
- Test file structure and naming conventions
- Gold standard test pattern with full example
- `beforeEach`/`afterEach` isolation pattern
- Comment conventions (`// Arrange - Description`)
- Validation functions (`validateStructuredContent`, `validateErrorResult`)
- Snapshot testing with `createSnapshotResult`
- Test types: CREATE, GET, UPDATE, DELETE, TREE operations
- Required imports checklist
- Pre-submission checklist

## Reference Implementation

The data-type tests serve as the reference implementation. See:
- `src/umb-management-api/tools/data-type/__tests__/`

## Related Skills

- `test-builder-helper-creator` - For creating test builders and helpers (prerequisite)
- `mcp-tool-creator` - For creating MCP tools (prerequisite)
