# /migrate-tools

Migrates MCP tools from the old pattern to the new standardized pattern using helper functions.

## Usage
```
/migrate-tools <tool-group-path>
```

Example:
```
/migrate-tools src/umb-management-api/tools/document-type
```

## Description
This command helps migrate MCP tools from the old manual pattern (direct client calls with JSON.stringify) to the new standardized pattern using helper functions like `executeGetApiCall`, `executeVoidApiCall`, and `createToolResult`.

## Old vs New Patterns

### DELETE Operations (Void)
**Old Pattern:**
```typescript
import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";

const DeleteTool = CreateUmbracoTool(
  "delete-item",
  "Deletes an item",
  schema.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    await client.deleteById(id);
    return {
      content: [{ type: "text" as const, text: JSON.stringify({ success: true }) }],
    };
  }
);
```

**New Pattern:**
```typescript
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const DeleteTool = {
  name: "delete-item",
  description: "Deletes an item",
  inputSchema: schema.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof schema.shape>;

export default withStandardDecorators(DeleteTool);
```

### GET Operations (Returns Data)
**Old Pattern:**
```typescript
const GetTool = CreateUmbracoTool(
  "get-item",
  "Gets an item",
  schema.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getById(id);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(response) }],
    };
  }
);
```

**New Pattern:**
```typescript
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { getByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetTool = {
  name: "get-item",
  description: "Gets an item",
  inputSchema: schema.shape,
  outputSchema: getByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof schema.shape, typeof getByIdResponse.shape>;

export default withStandardDecorators(GetTool);
```

### CREATE Operations (Returns ID)
**Old Pattern:**
```typescript
const CreateTool = CreateUmbracoTool(
  "create-item",
  "Creates an item",
  schema.shape,
  async (model) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.post(model);
    return {
      content: [{ type: "text" as const, text: JSON.stringify({ id: extractId(response) }) }],
    };
  }
);
```

**New Pattern:**
```typescript
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { AxiosResponse } from "axios";

export const createOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

const CreateTool = {
  name: "create-item",
  description: "Creates an item",
  inputSchema: schema.shape,
  outputSchema: createOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: Model) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.post(model, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      return createToolResult({
        message: "Item created successfully",
        id: extractIdFromHeader(response)
      });
    } else {
      return createToolResultError(response.data || {
        status: response.status,
        detail: response.statusText,
      });
    }
  }),
} satisfies ToolDefinition<typeof schema.shape, typeof createOutputSchema.shape>;

export default withStandardDecorators(CreateTool);
```

### UPDATE/PUT Operations (Void)
**New Pattern:**
```typescript
const UpdateTool = {
  name: "update-item",
  description: "Updates an item",
  inputSchema: schema.shape,
  annotations: { idempotentHint: true },
  slices: ['update'],
  handler: (async ({ id, data }) => {
    return executeVoidApiCall((client) =>
      client.putById(id, data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof schema.shape>;

export default withStandardDecorators(UpdateTool);
```

## Migration Steps

1. **Identify Tool Type** - Determine if the tool is:
   - DELETE (void operation)
   - GET (returns data)
   - POST create (returns ID)
   - POST/PUT update (void operation)
   - POST validate (void operation with readOnlyHint)

2. **Update Imports**
   ```typescript
   // Remove
   import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
   import { UmbracoManagementClient } from "@umb-management-client";

   // Add
   import { ToolDefinition } from "types/tool-definition.js";
   import { withStandardDecorators, executeVoidApiCall, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
   // For GET operations, also import the response schema:
   import { getXxxResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
   ```

3. **Convert to Object Literal Pattern**
   - Change from `CreateUmbracoTool()` function call to object literal with `satisfies ToolDefinition`
   - Rename `schema` to `inputSchema`
   - Add `outputSchema` for GET operations (use zod response schema)
   - Add `annotations` with appropriate hints
   - Add `slices` array for tool categorization

4. **Update Handler**
   - Remove manual client instantiation
   - Use appropriate helper function:
     - `executeVoidApiCall` for void operations
     - `executeGetApiCall` for operations that return data
     - `createToolResult`/`createToolResultError` for custom create responses
   - Add `CAPTURE_RAW_HTTP_RESPONSE` as last argument to client calls

5. **Add Annotations**
   - `readOnlyHint: true` - Operation only reads data, does not modify state (GET operations)
   - `destructiveHint: true` - Operation may delete or permanently modify data (DELETE operations)
   - `idempotentHint: true` - Calling multiple times with same args produces same result (PUT/UPDATE operations only)

   **Important:** DELETE operations are NOT idempotent because:
   - First call: succeeds and deletes the resource
   - Second call: fails with 404 (resource already deleted)
   - The results are different, so it's not idempotent

   PUT/UPDATE operations ARE idempotent because:
   - Calling with same data multiple times produces the same end state
   - No error on repeated calls

6. **Export Pattern**
   - Wrap with `withStandardDecorators()`
   - Use `export default`

## Annotation Reference Table

| Operation Type | readOnlyHint | destructiveHint | idempotentHint | Notes |
|---------------|--------------|-----------------|----------------|-------|
| **GET** | ✅ | ❌ | ❌ | Read-only, no state change |
| **DELETE** | ❌ | ✅ | ❌ | Destructive, NOT idempotent (2nd call fails) |
| **POST create** | ❌ | ❌ | ❌ | Creates new resource |
| **POST copy** | ❌ | ❌ | ❌ | Creates copy of resource |
| **POST validate** | ✅ | ❌ | ❌ | Validation only, no state change |
| **POST compositions** | ✅ | ❌ | ❌ | Query for available compositions |
| **PUT update** | ❌ | ❌ | ✅ | Idempotent (same result on repeat) |
| **PUT move** | ❌ | ❌ | ✅ | Idempotent (same result on repeat) |

### Why DELETE is NOT Idempotent
```
DELETE /item/123  → 200 OK (item deleted)
DELETE /item/123  → 404 Not Found (item already gone)
```
Different results = NOT idempotent

### Why PUT is Idempotent
```
PUT /item/123 {name: "foo"}  → 200 OK (item updated)
PUT /item/123 {name: "foo"}  → 200 OK (same state, no error)
```
Same result = Idempotent

## Checklist

For each tool, verify:
- [ ] Uses `ToolDefinition` type with `satisfies`
- [ ] Has `inputSchema` (not `schema`)
- [ ] Has `outputSchema` for GET operations
- [ ] Has appropriate `annotations`
- [ ] Has `slices` array
- [ ] Uses `withStandardDecorators()`
- [ ] Uses `CAPTURE_RAW_HTTP_RESPONSE`
- [ ] Handler uses correct helper function
- [ ] Exports output schema if CREATE operation (for tests)

## Common Zod Response Schemas

Import from `@/umb-management-api/umbracoManagementAPI.zod.js`:
- `get{Entity}ByIdResponse` - Single entity GET
- `get{Entity}Response` - List GET
- `getTree{Entity}ChildrenResponse` - Tree children
- `getTree{Entity}AncestorsResponse` - Tree ancestors
- `getItem{Entity}SearchResponse` - Search results
- `post{Entity}AvailableCompositionsResponse` - Compositions

## Notes

- The `CAPTURE_RAW_HTTP_RESPONSE` constant enables raw HTTP response capture for proper error handling
- `executeVoidApiCall` automatically handles errors and returns appropriate MCP responses
- `executeGetApiCall` puts response data in `structuredContent` for proper MCP SDK compliance
- `withStandardDecorators` adds error handling and version checking

## IMPORTANT: Array Response Schemas

**MCP does not allow arrays as output schemas - they MUST be wrapped in an object.**

Many Umbraco API responses return arrays (e.g., `getTreeDocumentAncestorsResponse`, `getDocumentByIdNotificationsResponse`). These are defined in the Zod schemas as `zod.array(...)`.

### How to identify array responses
Array response schemas:
- Don't have `.shape` property (objects do)
- Are named with patterns like `get{Entity}AncestorsResponse`, `getItem{Entity}Response`, `get{Entity}ByIdNotificationsResponse`

### How to fix array responses
Wrap them in an object with an `items` property:

```typescript
// WRONG - array schema directly (will cause TypeScript error)
outputSchema: getTreeDocumentAncestorsResponse,  // This is zod.array(...)

// CORRECT - wrap in object
import { z } from "zod";

const outputSchema = z.object({
  items: getTreeDocumentAncestorsResponse,
});

const MyTool = {
  // ...
  outputSchema: outputSchema.shape,
  handler: (async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentAncestors(id);
    return createToolResult({ items: response });  // Wrap response
  }),
} satisfies ToolDefinition<typeof inputSchema.shape, typeof outputSchema.shape>;
```

### Key differences from object responses
| Object Response | Array Response |
|----------------|----------------|
| Use `executeGetApiCall` | Use `createToolResult` with manual client call |
| Use `response.shape` | Wrap in `z.object({ items: response })` |
| Response used directly | Response wrapped in `{ items: ... }` |

## Post-Migration Validation

After completing the migration, perform these validation steps:

### 1. TypeScript Compilation Check
Run TypeScript compilation to catch syntax errors:
```bash
npm run type-check
```

Common errors to watch for:
- Missing closing parenthesis on handler arrow functions: `handler: (async () => {...}),` (note the `)` before the comma)
- Missing imports for types or helper functions
- Incorrect type parameters on `satisfies ToolDefinition<...>`

### 2. Migration Reviewer Agent
The `migration-reviewer` agent should automatically run to validate:
- Correct annotation usage (especially that DELETE does NOT have idempotentHint)
- Correct helper function usage
- Proper outputSchema for GET operations
- Correct import patterns
- Handler uses arrow function format: `handler: (async (...) => {...}),`

### Handler Arrow Function Pattern
The handler MUST use this exact pattern with parentheses wrapping the async function:
```typescript
// CORRECT
handler: (async (model: Model) => {
  // implementation
}),

// WRONG - missing outer parentheses
handler: async (model: Model) => {
  // implementation
},
```

The outer parentheses are required for the `satisfies` type checking to work correctly.

---

## Next Step: Migrate Tests

After completing the tool migration, you should also migrate the corresponding tests to use the new patterns.

Run:
```
/migrate-tests <test-folder-path>
```

Example:
```
/migrate-tests src/umb-management-api/tools/document-type/__tests__
```

The migrate-tests command will:
1. Update test files to use `createMockRequestHandlerExtra()` and `setupTestEnvironment()`
2. Replace `JSON.parse(getResultText(result))` with `validateStructuredContent()`
3. Update snapshot tests to use `createSnapshotResult()`
4. Run tests with `-u` flag to update snapshots

ARGUMENTS: $ARGUMENTS
