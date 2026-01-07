# /migrate-tests

Migrates MCP tool tests from the old pattern to the new standardized pattern using test helpers.

## Usage
```
/migrate-tests <test-folder-path>
```

Example:
```
/migrate-tests src/umb-management-api/tools/document-type/__tests__
```

## Description
This command helps migrate MCP tool tests from the old pattern (JSON.parse with getResultText) to the new standardized pattern using `validateStructuredContent`, `validateErrorResult`, and `createSnapshotResult`.

## Old vs New Patterns

### Accessing Response Data

**Old Pattern:**
```typescript
import { createMockRequestHandlerExtra, getResultText } from "@/test-helpers/create-mock-request-handler-extra.js";

const result = await Tool.handler(params, createMockRequestHandlerExtra());
const data = JSON.parse(getResultText(result));
expect(data.name).toBe("expected");
```

**New Pattern:**
```typescript
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { getEntityResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const result = await Tool.handler(params, createMockRequestHandlerExtra());
const data = validateStructuredContent(result, getEntityResponse);
expect(data.name).toBe("expected");
```

### Validating Error Results

**Old Pattern:**
```typescript
const result = await Tool.handler(params, createMockRequestHandlerExtra());
expect(result.isError).toBe(true);
// or check content[0].text for error message
```

**New Pattern:**
```typescript
import { validateErrorResult } from "@/test-helpers/create-mock-request-handler-extra.js";

const result = await Tool.handler(params, createMockRequestHandlerExtra());
validateErrorResult(result);
expect(result).toMatchSnapshot();
```

### Snapshot Testing

**Old Pattern:**
```typescript
// Manual normalization of content[0].text
const normalizedResult = {
  ...result,
  content: result.content.map(content => {
    const parsed = JSON.parse((content as any).text);
    return {
      ...content,
      text: JSON.stringify({
        ...parsed,
        items: normalizeIds(parsed.items)
      })
    };
  })
};
expect(normalizedResult).toMatchSnapshot();
```

**New Pattern:**
```typescript
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

const result = await Tool.handler(params, createMockRequestHandlerExtra());
expect(createSnapshotResult(result)).toMatchSnapshot();
```

### Testing Void Operations (DELETE, UPDATE, etc.)

**Old Pattern:**
```typescript
const result = await DeleteTool.handler({ id }, createMockRequestHandlerExtra());
const parsed = JSON.parse(getResultText(result));
expect(parsed.success).toBe(true);
```

**New Pattern:**
```typescript
const result = await DeleteTool.handler({ id }, createMockRequestHandlerExtra());
expect(result.isError).toBeFalsy();
expect(result).toMatchSnapshot();
```

### Testing Validation Errors (Zod Schema Failures)

**Old Pattern:**
```typescript
// Expected Zod to throw
await expect(async () => {
  await Tool.handler(invalidModel, createMockRequestHandlerExtra());
}).rejects.toThrow();
```

**New Pattern:**
```typescript
// withStandardDecorators catches errors and returns them
const result = await Tool.handler(invalidModel, createMockRequestHandlerExtra());
expect(result.isError).toBe(true);
```

### Testing Create Operations with Output Schema

**Old Pattern:**
```typescript
const result = await CreateTool.handler(model, createMockRequestHandlerExtra());
const data = JSON.parse(getResultText(result));
const id = data.id;
expect(createSnapshotResult(result, id)).toMatchSnapshot();
```

**New Pattern:**
```typescript
import { createOutputSchema } from "../post/create-entity.js";

const result = await CreateTool.handler(model, createMockRequestHandlerExtra());
const responseData = validateStructuredContent(result, createOutputSchema);
const id = responseData.id;
expect(responseData.message).toBe("Entity created successfully");
expect(createSnapshotResult(result, id)).toMatchSnapshot();
```

### Accessing Array Responses (get-all, etc.)

**Old Pattern:**
```typescript
const items = JSON.parse((result.content[0] as any).text ?? "[]");
```

**New Pattern (for tools using executeGetApiCall):**
```typescript
const data = validateStructuredContent(result, getItemsResponse);
const items = data.items;
```

**New Pattern (for tools using createToolResult with custom schema):**
```typescript
// For tools that wrap arrays in { items: [...] }
const items = (result.structuredContent as any).items;
```

## Migration Steps

1. **Update Imports**
   ```typescript
   // Remove
   import { getResultText } from "@/test-helpers/create-mock-request-handler-extra.js";

   // Add
   import { validateStructuredContent, validateErrorResult } from "@/test-helpers/create-mock-request-handler-extra.js";
   import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
   // Import the response schema for the tool being tested
   import { getEntityResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
   // Or for create operations, import the output schema from the tool
   import { createOutputSchema } from "../post/create-entity.js";
   ```

2. **Replace Data Access Pattern**
   - Find: `JSON.parse(getResultText(result))`
   - Replace: `validateStructuredContent(result, responseSchema)`

3. **Update Error Testing**
   - Find: `await expect(...).rejects.toThrow()`
   - Replace: `expect(result.isError).toBe(true)`

4. **Update Void Operation Tests**
   - Find: `JSON.parse(getResultText(result))` with success check
   - Replace: `expect(result.isError).toBeFalsy()`

5. **Update Snapshot Tests**
   - Use `createSnapshotResult(result)` for automatic normalization
   - Use `createSnapshotResult(result, specificId)` when you need to normalize a specific ID

6. **Update Error Response Snapshots**
   - Use `normalizeErrorResponse(result)` to normalize traceIds

7. **Run Tests with `-u` Flag**
   - After migration, run `npm test -- -u` to update snapshots

## Response Schema Reference

For `validateStructuredContent`, use the appropriate Zod schema from:
- `@/umb-management-api/umbracoManagementAPI.zod.js` - Generated API response schemas
- Tool file exports - Custom output schemas for create operations

Common schemas:
| Operation Type | Schema Pattern |
|---------------|----------------|
| GET by ID | `get{Entity}ByIdResponse` |
| GET list | `get{Entity}Response` |
| GET tree children | `getTree{Entity}ChildrenResponse` |
| GET tree ancestors | `getTree{Entity}AncestorsResponse` |
| GET search | `getItem{Entity}SearchResponse` |
| GET configuration | `get{Entity}ConfigurationResponse` |
| POST compositions | `post{Entity}AvailableCompositionsResponse` |
| CREATE | `create{Entity}OutputSchema` (from tool file) |

## Checklist

For each test file:
- [ ] Removed `getResultText` import (unless still needed)
- [ ] Added `validateStructuredContent` import
- [ ] Added appropriate response schema import
- [ ] Replaced `JSON.parse(getResultText(result))` with `validateStructuredContent`
- [ ] Updated error tests to check `result.isError` instead of expecting throws
- [ ] Updated void operation tests to check `result.isError` is falsy
- [ ] Used `createSnapshotResult` for snapshot normalization
- [ ] Used `normalizeErrorResponse` for error snapshots with traceIds
- [ ] Ran tests with `-u` to update snapshots

## Common Issues

### Empty String from getResultText
If `getResultText(result)` returns empty string, the tool is using `structuredContent` format. Access via:
```typescript
result.structuredContent
// or
validateStructuredContent(result, schema)
```

### Snapshot Showing Old IDs
If snapshots show real IDs instead of `00000000-0000-0000-0000-000000000000`, use `createSnapshotResult()` to normalize:
```typescript
expect(createSnapshotResult(result)).toMatchSnapshot();
```

### traceId Mismatch in Error Snapshots
Use `normalizeErrorResponse` to normalize traceIds:
```typescript
import { normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";

expect(normalizeErrorResponse(result)).toMatchSnapshot();
```

### Validation Test No Longer Throws
The `withStandardDecorators` wrapper catches all errors. Test for error result instead:
```typescript
// Old: await expect(...).rejects.toThrow()
// New:
const result = await Tool.handler(invalidData, createMockRequestHandlerExtra());
expect(result.isError).toBe(true);
```

## Notes

- `validateStructuredContent` validates the response against the schema and throws if invalid
- `validateErrorResult` throws if the result is not an error
- `createSnapshotResult` handles both `structuredContent` and legacy `content[0].text` formats
- After migration, always run tests to verify and update snapshots with `-u` flag

## Post-Migration Validation

After completing the migration, perform these validation steps:

### 1. TypeScript Compilation Check
Run TypeScript compilation to catch syntax errors:
```bash
npm run type-check
```

Common errors to watch for:
- Missing imports for `validateStructuredContent`, `validateErrorResult`, or `createSnapshotResult`
- Incorrect schema imports (wrong schema name or path)
- Type mismatches when accessing `structuredContent` properties

### 2. Run Tests
Run the migrated tests to verify they work correctly:
```bash
npm test -- <path-to-test-file>
```

If snapshots need updating:
```bash
npm test -- <path-to-test-file> -u
```

### 3. Migration Reviewer Agent
The `migration-reviewer` agent should automatically run to validate:
- Correct use of `validateStructuredContent` instead of `JSON.parse(getResultText(result))`
- Proper snapshot testing with `createSnapshotResult()`
- Error testing uses `result.isError` instead of `rejects.toThrow()`
- Correct import patterns
- No remaining `getResultText` usage (unless intentionally kept)

## IMPORTANT: Run Tests After Migration

After completing all test migrations, you MUST run the tests with the `-u` flag to update snapshots:

```bash
npm test -- --testPathPattern="<entity-name>" -u
```

For example, if migrating dictionary tests:
```bash
npm test -- --testPathPattern="dictionary" -u
```

This will:
1. Run all tests matching the pattern
2. Update any outdated snapshots to reflect the new `structuredContent` format
3. Verify all tests pass with the migrated code

Do NOT consider the migration complete until all tests pass.

---

## Execution Instructions

When this command is invoked with an argument (e.g., `/migrate-tests dictionary`), you should:

1. Migrate all test files in the specified tool group's `__tests__` folder
2. Run TypeScript compilation check on the migrated files
3. **Run the tests with `-u` flag to update snapshots:**
   ```bash
   npm test -- --testPathPattern="<argument>" -u
   ```
4. Verify all tests pass before reporting completion

ARGUMENTS: $ARGUMENTS
