---
name: create-integration-tests
description: Create integration tests for MCP tools following established patterns. Use when creating new test suites for tools, or when asked to write tests for existing tools.
---

# Create Integration Tests for MCP Tools

This skill provides comprehensive guidance for creating integration tests for MCP tools in the Umbraco MCP Server project.

## When to Use

Use this skill when:
- Creating new integration tests for MCP tools
- Adding tests to existing tool collections
- Reviewing test patterns for consistency
- Understanding the test infrastructure

## Prerequisites

Before creating integration tests, ensure:
1. **MCP tools exist** - Tools must be created and TypeScript compilation passes
2. **Builders exist** - Test builders for the entity must be created and tested
3. **Helpers exist** - Test helpers with cleanup/find methods must exist and be tested
4. All prerequisite tests are passing

## Test File Structure

### Location
Tests go in `__tests__` folder within each feature:
```
src/umb-management-api/tools/{entity}/__tests__/
├── helpers/
│   ├── {entity}-builder.ts
│   ├── {entity}-folder-builder.ts (if applicable)
│   └── {entity}-test-helper.ts
├── create-{entity}.test.ts
├── delete-{entity}.test.ts
├── find-{entity}.test.ts
├── get-{entity}.test.ts
├── update-{entity}.test.ts
├── move-{entity}.test.ts (if applicable)
├── copy-{entity}.test.ts (if applicable)
├── folder-{entity}.test.ts (if applicable)
└── {entity}-tree.test.ts (for ancestors, children, root)
```

### Naming Conventions
- Test files: `{action}-{entity}.test.ts` (e.g., `create-data-type.test.ts`)
- Describe blocks: Match the filename (e.g., `describe("create-data-type", () => {...})`)
- Constants: Module-level, prefixed with `TEST_` (e.g., `const TEST_NAME = "_Test Entity"`)

## Gold Standard Test Pattern

```typescript
import SomeTool from "../path/to-tool.js";
import { SomeBuilder } from "./helpers/some-builder.js";
import { SomeTestHelper } from "./helpers/some-test-helper.js";
import { jest } from "@jest/globals";
import {
  createMockRequestHandlerExtra,
  validateStructuredContent,
  validateErrorResult
} from "@/test-helpers/create-mock-request-handler-extra.js";
import { someResponseSchema } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_ENTITY_NAME = "_Test Entity Name";
const TEST_FOLDER_NAME = "_Test Folder Name";

describe("tool-name", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await SomeTestHelper.cleanup(TEST_ENTITY_NAME);
    await SomeTestHelper.cleanup(TEST_FOLDER_NAME);
    console.error = originalConsoleError;
  });

  it("should do something successfully", async () => {
    // Arrange - Create test entity
    const builder = await new SomeBuilder()
      .withName(TEST_ENTITY_NAME)
      .create();

    // Act - Call the tool handler
    const result = await SomeTool.handler(
      { id: builder.getId() },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify response matches schema
    validateStructuredContent(result, someResponseSchema);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle non-existent entity", async () => {
    // Act - Try to operate on non-existent entity
    const result = await SomeTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify error response
    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });
});
```

## Key Patterns and Rules

### 1. Test Isolation
- Use `beforeEach`/`afterEach` (NOT `beforeAll`/`afterAll`)
- Each test creates its own data
- Clean up ALL created entities in `afterEach`

### 2. Comment Pattern
Use combined structural and descriptive comments:
```typescript
// Arrange - Create a folder for the test
// Act - Move the entity to the folder
// Assert - Verify the entity was moved
```

**NOT** just:
```typescript
// Arrange
// Act
// Assert
```

### 3. Console Error Suppression
Always suppress console.error in tests:
```typescript
let originalConsoleError: typeof console.error;

beforeEach(() => {
  originalConsoleError = console.error;
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});
```

### 4. Validation Functions

| Function | When to Use |
|----------|-------------|
| `validateStructuredContent(result, schema)` | Success responses with Zod schema |
| `validateErrorResult(result)` | Error responses (404, 400, etc.) |
| `createSnapshotResult(result)` | Before snapshot assertion |

### 5. Constants
- Define at module level (before describe block)
- Use `_Test` prefix for easy identification/cleanup
- Never use magic strings in tests

```typescript
const TEST_ENTITY_NAME = "_Test Entity";
const TEST_FOLDER_NAME = "_Test Folder";
const TEST_COPY_NAME = "_Test Entity (copy)";
```

### 6. Handler Calls
Always use `createMockRequestHandlerExtra()`:
```typescript
const result = await SomeTool.handler(
  { id: builder.getId(), body: { ... } },
  createMockRequestHandlerExtra()
);
```

### 7. Snapshot Testing
Always normalize before snapshot:
```typescript
// For success responses
expect(createSnapshotResult(result)).toMatchSnapshot();

// For error responses (no normalization needed)
expect(result).toMatchSnapshot();
```

## Test Types by Operation

### CREATE Tests
```typescript
it("should create an entity", async () => {
  // Arrange - Prepare creation data (no entity exists yet)

  // Act - Call create tool
  const result = await CreateTool.handler(
    { body: { name: TEST_NAME, ... } },
    createMockRequestHandlerExtra()
  );

  // Assert - Verify creation response
  validateStructuredContent(result, createResponseSchema);
  expect(createSnapshotResult(result)).toMatchSnapshot();

  // Assert - Verify entity exists
  const created = await TestHelper.findEntity(TEST_NAME);
  expect(created).toBeTruthy();
});

it("should handle duplicate name", async () => {
  // Arrange - Create existing entity
  await new Builder().withName(TEST_NAME).create();

  // Act - Try to create duplicate
  const result = await CreateTool.handler(
    { body: { name: TEST_NAME, ... } },
    createMockRequestHandlerExtra()
  );

  // Assert - Verify error response
  validateErrorResult(result);
  expect(result).toMatchSnapshot();
});
```

### GET Tests
```typescript
it("should get entity by id", async () => {
  // Arrange - Create entity to retrieve
  const builder = await new Builder().withName(TEST_NAME).create();

  // Act - Get the entity
  const result = await GetTool.handler(
    { id: builder.getId() },
    createMockRequestHandlerExtra()
  );

  // Assert - Verify response
  validateStructuredContent(result, getResponseSchema);
  expect(createSnapshotResult(result)).toMatchSnapshot();
});

it("should handle non-existent entity", async () => {
  // Act - Try to get non-existent entity
  const result = await GetTool.handler(
    { id: BLANK_UUID },
    createMockRequestHandlerExtra()
  );

  // Assert - Verify error response
  validateErrorResult(result);
  expect(result).toMatchSnapshot();
});
```

### UPDATE Tests
```typescript
it("should update an entity", async () => {
  // Arrange - Create entity to update
  const builder = await new Builder().withName(TEST_NAME).create();

  // Act - Update the entity
  const result = await UpdateTool.handler(
    {
      id: builder.getId(),
      body: { name: TEST_NAME, newField: "updated value" }
    },
    createMockRequestHandlerExtra()
  );

  // Assert - Verify update response
  validateStructuredContent(result, updateResponseSchema);
  expect(createSnapshotResult(result)).toMatchSnapshot();

  // Assert - Verify entity was updated
  const updated = await TestHelper.findEntity(TEST_NAME);
  expect(updated?.newField).toBe("updated value");
});
```

### DELETE Tests
```typescript
it("should delete an entity", async () => {
  // Arrange - Create entity to delete
  const builder = await new Builder().withName(TEST_NAME).create();

  // Act - Delete the entity
  const result = await DeleteTool.handler(
    { id: builder.getId() },
    createMockRequestHandlerExtra()
  );

  // Assert - Verify deletion response
  expect(result).toMatchSnapshot();

  // Assert - Verify entity no longer exists
  const deleted = await TestHelper.findEntity(TEST_NAME);
  expect(deleted).toBeFalsy();
});

it("should handle deleting non-existent entity", async () => {
  // Act - Try to delete non-existent entity
  const result = await DeleteTool.handler(
    { id: BLANK_UUID },
    createMockRequestHandlerExtra()
  );

  // Assert - Verify error response
  validateErrorResult(result);
  expect(result).toMatchSnapshot();
});
```

### TREE Tests (Ancestors, Children, Root)
Group these in a single `{entity}-tree.test.ts` file:

```typescript
describe("entity-tree", () => {
  describe("children", () => {
    it("should get child items", async () => {
      // Arrange - Create parent folder
      const folderBuilder = await new FolderBuilder(TEST_FOLDER_NAME).create();

      // Arrange - Create child entity
      await new Builder()
        .withName(TEST_CHILD_NAME)
        .withParentId(folderBuilder.getId())
        .create();

      // Act - Get children of folder
      const result = await GetChildrenTool.handler(
        { parentId: folderBuilder.getId(), take: 100 },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify children response
      validateStructuredContent(result, getChildrenResponseSchema);
      expect(createSnapshotResult(result)).toMatchSnapshot();
    });
  });

  describe("ancestors", () => {
    it("should get ancestor items", async () => {
      // Arrange - Create folder structure
      const folderBuilder = await new FolderBuilder(TEST_FOLDER_NAME).create();
      const childBuilder = await new Builder()
        .withName(TEST_CHILD_NAME)
        .withParentId(folderBuilder.getId())
        .create();

      // Act - Get ancestors of child
      const result = await GetAncestorsTool.handler(
        { descendantId: childBuilder.getId() },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify ancestors response
      validateStructuredContent(result, getAncestorsResponseSchema);
      expect(createSnapshotResult(result)).toMatchSnapshot();
    });
  });
});
```

## Required Imports

```typescript
// Tool under test
import SomeTool from "../path/to-tool.js";

// Builders and helpers
import { SomeBuilder } from "./helpers/some-builder.js";
import { SomeTestHelper } from "./helpers/some-test-helper.js";

// Jest
import { jest } from "@jest/globals";

// Test utilities
import {
  createMockRequestHandlerExtra,
  validateStructuredContent,
  validateErrorResult
} from "@/test-helpers/create-mock-request-handler-extra.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

// Zod schemas (for validation)
import {
  getSomeResponseSchema,
  postSomeResponseSchema
} from "@/umb-management-api/umbracoManagementAPI.zod.js";

// Constants
import { BLANK_UUID } from "@/constants/constants.js";
```

## Checklist Before Submitting Tests

- [ ] Describe block name matches filename
- [ ] All constants at module level with `_Test` prefix
- [ ] Using `beforeEach`/`afterEach` pattern (not `beforeAll`)
- [ ] Console error suppressed in `beforeEach`
- [ ] All created entities cleaned up in `afterEach`
- [ ] Combined `// Arrange - Description` comments in all tests
- [ ] `validateStructuredContent` used for success responses with schemas
- [ ] `validateErrorResult` used for error test cases
- [ ] `createSnapshotResult` used before snapshot assertions
- [ ] Error cases tested (non-existent entities, duplicates, etc.)
- [ ] TypeScript compilation passes
- [ ] All tests pass

## Running Tests

```bash
# Run all tests for a specific entity
npm test -- --testPathPattern="data-type"

# Run a specific test file
npm test -- src/umb-management-api/tools/data-type/__tests__/create-data-type.test.ts

# Update snapshots
npm test -- --updateSnapshot --testPathPattern="data-type"
```
