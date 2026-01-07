# Complete Examples

Working examples of eval tests demonstrating all best practices.

## Example: Member Management Eval Test

This is a complete example that demonstrates all best practices:

**Note**: Member create returns an ID directly, so this test doesn't need the "search after create" pattern. However, the prompt includes explicit search steps to demonstrate the full CRUD workflow.

```typescript
import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "./helpers/index.js";

const MEMBER_MANAGEMENT_TOOLS = [
  // Member Type info
  "get-member-type",
  "search-member-type-items",
  // Member CRUD
  "create-member",
  "get-member",
  "find-member",
  "update-member",
  "validate-member",
  // References
  "get-member-are-referenced",
  "get-member-by-id-referenced-by",
  // Cleanup
  "delete-member"
] as const;

describe("member management eval tests", () => {
  setupConsoleMock();

  it("should create, update, and manage member lifecycle",
    runScenarioTest({
      prompt: `Complete these tasks in order using a unique identifier for this test run:
- Generate a unique test identifier using current timestamp (e.g., Date.now()) to make email and username unique
- Search for member types using search-member-type-items with query "Member" to find the default member type
- Create a new member using the member type ID from the search result:
  - email: "test.eval.{timestamp}@example.com" (replace {timestamp} with unique identifier)
  - username: "test_eval_{timestamp}" (replace {timestamp} with unique identifier)
  - password: "TestPass123!@#" (must be at least 10 characters with number and symbol)
  - memberType: { "id": "<use the ID from search result>" }
  - isApproved: true
  - variants: [{ "name": "_Test Member Eval {timestamp}", "culture": null, "segment": null }]
  - values: [] (empty array - no additional values needed for default member type)
- Find the newly created member by searching with find-member using the username you created
- Get the full member details using get-member with the member ID from the find result
- Update the member using update-member to change the name in variants to "_Test Member Eval Updated"
- Validate the updated member data using validate-member with the member ID
- Check if the member is referenced anywhere using get-member-are-referenced with the member ID
- Delete the member using delete-member with the member ID
- Try to find the member again using find-member to verify deletion (this should return no results)
- When all tasks complete, say 'The member management workflow has completed successfully'`,
      tools: MEMBER_MANAGEMENT_TOOLS,
      requiredTools: [
        "create-member",
        "find-member",
        "get-member",
        "update-member",
        "validate-member",
        "delete-member"
      ],
      successPattern: "member management workflow has completed successfully",
      options: { maxTurns: 20 },
      verbose: true,  // Enable during development, disable for production
    }),
    180000
  );
});
```

### Why This Example Works

1. ✅ **Uses unique identifiers** - Timestamp-based email/username
2. ✅ **Searches for IDs** - Finds member type dynamically
3. ✅ **Clear step-by-step** - Numbered, explicit instructions
4. ✅ **Full CRUD cycle** - Create, Read, Update, Delete
5. ✅ **Includes verification** - Checks references, verifies deletion
6. ✅ **Proper cleanup** - Deletes created entities
7. ✅ **Success pattern** - Clear completion message
8. ✅ **Reasonable limits** - 20 turns, 180s timeout
9. ✅ **Grouped tools** - Organized by category with comments
10. ✅ **Required tools** - Explicitly lists must-use tools

## Example: Document with "Search After Create" Pattern

For entities where create returns void:

```typescript
import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "./helpers/index.js";

const DOCUMENT_TOOLS = [
  // Document Type info
  "search-document-type-items",
  // Document CRUD
  "create-document",
  "find-document",
  "get-document",
  "update-document",
  "delete-document"
] as const;

describe("document lifecycle eval tests", () => {
  setupConsoleMock();

  it("should create, update, and manage document lifecycle",
    runScenarioTest({
      prompt: `Complete these tasks in order using a unique identifier for this test run:
- Generate a unique test identifier using current timestamp (e.g., Date.now())
- Search for document types to find an appropriate type for testing
- Create a new document with unique name "Test Document {timestamp}":
  - Use a document type from the search result
  - Name: "Test Document {timestamp}"
  - Make the name UNIQUE using the timestamp
- IMPORTANT: Document create may not return an ID
  - Immediately search for the document using find-document with the EXACT name "Test Document {timestamp}"
  - The name must be unique, so you should find exactly one result
  - Extract the document ID from the search result
  - Store this ID for all subsequent operations
- Get the full document details using get-document with the ID you found
- Update the document to change the name to "Test Document {timestamp} Updated"
- Delete the document using delete-document with the ID
- Search again to verify the document no longer exists
- When all tasks complete, say 'The document lifecycle workflow has completed successfully'`,
      tools: DOCUMENT_TOOLS,
      requiredTools: [
        "create-document",
        "find-document",
        "get-document",
        "update-document",
        "delete-document"
      ],
      successPattern: "document lifecycle workflow has completed successfully",
      options: { maxTurns: 20 },
      verbose: true,
    }),
    180000
  );
});
```

### Key Differences from Member Example

1. **Explicit search after create** - Document create returns void
2. **Emphasizes unique name** - Critical for finding the created document
3. **Stores ID explicitly** - LLM must remember the ID from search
4. **Uses exact name matching** - "EXACT name" in prompt

## Example: Minimal Test Structure

For simpler workflows:

```typescript
import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "./helpers/index.js";

const DATA_TYPE_TOOLS = [
  "create-data-type",
  "find-data-type",
  "delete-data-type"
] as const;

describe("data type creation eval tests", () => {
  setupConsoleMock();

  it("should create and delete a data type",
    runScenarioTest({
      prompt: `Complete these tasks:
- Create a data type with unique name "Test DataType {timestamp}" (use current timestamp)
- Find the created data type by searching for "Test DataType {timestamp}"
- Delete the data type using the ID from search result
- Say 'Data type workflow completed' when done`,
      tools: DATA_TYPE_TOOLS,
      requiredTools: ["create-data-type", "delete-data-type"],
      successPattern: "Data type workflow completed",
      options: { maxTurns: 10 },
    }),
    120000
  );
});
```

### When to Use Minimal Structure

- **Simple workflows** - Just create and delete
- **Quick smoke tests** - Verify basic functionality
- **Early development** - Test before adding complexity
- **Focused testing** - One specific feature

## Common Test Structures

### Structure 1: Full CRUD Lifecycle

```typescript
prompt: `
1. Search for type/parent entity
2. Create entity with unique identifier
3. Find/search for created entity
4. Get full details
5. Update entity
6. Verify update
7. Delete entity
8. Verify deletion
`
```

**Use when**: Testing complete entity management

### Structure 2: Create and Delete Only

```typescript
prompt: `
1. Create entity with unique identifier
2. Find entity (if create returns void)
3. Delete entity
4. Verify deletion
`
```

**Use when**: Quick smoke testing

### Structure 3: Hierarchical Operations

```typescript
prompt: `
1. Get root/parent entity
2. Create child entity under parent
3. Get children of parent
4. Verify child appears in list
5. Delete child
`
```

**Use when**: Testing tree/hierarchical structures

### Structure 4: Complex Workflows

```typescript
prompt: `
1. Set up prerequisites (types, parents, etc.)
2. Create main entity
3. Create related entities
4. Update with relationships
5. Verify relationships
6. Clean up all entities
`
```

**Use when**: Testing complex features with dependencies

## Tips for Writing Examples

1. **Start with member management** - It's the gold standard
2. **Copy and adapt** - Don't reinvent patterns
3. **Test your examples** - Run them 3 times minimum
4. **Document edge cases** - Add comments explaining unusual patterns
5. **Keep it focused** - One workflow per test
6. **Use verbose during dev** - Disable for production
7. **Include cleanup** - Always delete created entities
8. **Verify completion** - Check the workflow finished successfully
