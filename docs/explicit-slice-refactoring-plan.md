# Explicit Slice Assignment Refactoring Plan

## Status: Planning Document
This document outlines a refactoring to replace **pattern-based slice matching** with **explicit slice declarations** on each tool.

## Problem Statement

The current slice filtering system uses regex pattern matching on tool names to determine which slice a tool belongs to. This approach is:

1. **Fragile** - Pattern order matters; edge cases like `delete-data-type-folder` can match wrong slices
2. **Implicit** - Reading a tool file doesn't tell you what slice it belongs to
3. **Hard to test** - Must test pattern matching logic separately from tool definitions
4. **Error-prone** - New tools may accidentally match wrong patterns

### Example Bug (discovered during testing)
```
UMBRACO_INCLUDE_SLICES=create,read,update
```
Expected: `delete-data-type-folder` should be blocked (it's a delete operation)
Actual: Tool was accessible because `-folder` suffix matched the `read` slice pattern

## Proposed Solution

Replace pattern-based matching with **explicit slice arrays** on each `ToolDefinition`.

### Key Design Decisions

1. **Slices as arrays** - A tool can belong to multiple slices (e.g., a tool could be both `read` and `tree`)
2. **Empty array = always included** - Tools with `slices: []` are never filtered out by slice configuration
3. **Explicit registration** - Keep current collection-based registration (no dynamic file discovery)
4. **Type-safe slice names** - Use TypeScript union type for valid slice names

## Slice Definitions (28 slices)

### Core CRUD (4 slices)
| Slice | Description |
|-------|-------------|
| `create` | Create entities including folders |
| `read` | Get entity by ID, path, or ISO code |
| `update` | Update entities including folders |
| `delete` | Delete entities including folders |

### Tree Navigation (1 slice)
| Slice | Description |
|-------|-------------|
| `tree` | Hierarchical navigation (root, children, ancestors, siblings) |

### Query Slices (3 slices)
| Slice | Description |
|-------|-------------|
| `search` | Search and filter operations |
| `list` | List all items |
| `references` | Reference/dependency queries |

### Workflow Slices (7 slices)
| Slice | Description |
|-------|-------------|
| `publish` | Publishing operations |
| `recycle-bin` | Recycle bin operations |
| `move` | Move operations |
| `copy` | Copy operations |
| `sort` | Sort/reorder operations |
| `validate` | Validation operations |
| `rename` | Rename file-based entities |

### Information Slices (6 slices)
| Slice | Description |
|-------|-------------|
| `configuration` | Configuration retrieval |
| `audit` | Audit trail access |
| `urls` | URL and domain management |
| `permissions` | User permission queries |
| `user-status` | User account operations |
| `current-user` | Current user context |

### Entity Management Slices (4 slices)
| Slice | Description |
|-------|-------------|
| `notifications` | Content notification settings |
| `public-access` | Content protection rules |
| `scaffolding` | Content creation helpers |
| `blueprints` | Blueprint specialized operations |

### System Slices (3 slices)
| Slice | Description |
|-------|-------------|
| `server-info` | Server status/info |
| `diagnostics` | System diagnostics |
| `templates` | Template/snippet helpers |

**Total: 28 slices**

---

## Type Definitions

### Updated ToolDefinition Interface
**File:** `src/types/tool-definition.ts`

```typescript
// Valid slice names as a union type for compile-time safety
export type ToolSliceName =
  // CRUD
  | 'create' | 'read' | 'update' | 'delete'
  // Navigation
  | 'tree'
  // Query
  | 'search' | 'list' | 'references'
  // Workflow
  | 'publish' | 'recycle-bin' | 'move' | 'copy' | 'sort' | 'validate' | 'rename'
  // Information
  | 'configuration' | 'audit' | 'urls' | 'permissions' | 'user-status' | 'current-user'
  // Entity Management
  | 'notifications' | 'public-access' | 'scaffolding' | 'blueprints'
  // System
  | 'server-info' | 'diagnostics' | 'templates';

export interface ToolDefinition<Args extends undefined | ZodRawShape = undefined> {
  name: string;
  description: string;
  schema: Args;
  handler: ToolCallback<Args>;
  enabled?: (user: CurrentUserResponseModel) => boolean;
  isReadOnly: boolean;
  slices: ToolSliceName[];  // NEW: Explicit slice assignment (empty array = always included)
}
```

### Updated Tool Creation Helpers
**File:** `src/helpers/mcp/create-umbraco-tool.ts`

```typescript
export function CreateUmbracoReadTool<Args extends ZodRawShape>(
  name: string,
  description: string,
  schema: Args,
  handler: ToolHandler<Args>,
  slices: ToolSliceName[],  // NEW: Required parameter
  enabled?: EnabledCheck
): () => ToolDefinition<Args> {
  return () => ({
    name,
    description,
    schema,
    handler: wrapHandler(handler),
    enabled,
    isReadOnly: true,
    slices,
  });
}

export function CreateUmbracoWriteTool<Args extends ZodRawShape>(
  name: string,
  description: string,
  schema: Args,
  handler: ToolHandler<Args>,
  slices: ToolSliceName[],  // NEW: Required parameter
  enabled?: EnabledCheck
): () => ToolDefinition<Args> {
  return () => ({
    name,
    description,
    schema,
    handler: wrapHandler(handler),
    enabled,
    isReadOnly: false,
    slices,
  });
}
```

---

## Tool Factory Changes
**File:** `src/umb-management-api/tools/tool-factory.ts`

### Updated Filtering Logic

```typescript
function isToolAllowedBySlices(
  toolSlices: ToolSliceName[],
  enabledSlices: string[],
  disabledSlices: string[]
): boolean {
  // Tools with empty slices array are ALWAYS included
  if (toolSlices.length === 0) {
    return true;
  }

  // Check if ANY of the tool's slices is in the disabled list
  if (disabledSlices.length > 0) {
    if (toolSlices.some(slice => disabledSlices.includes(slice))) {
      return false;
    }
  }

  // If enabled slices specified, tool must have at least one matching slice
  if (enabledSlices.length > 0) {
    return toolSlices.some(slice => enabledSlices.includes(slice));
  }

  return true;
}

const mapTools = (
  server: McpServer,
  user: CurrentUserResponseModel,
  tools: ToolDefinition<any>[],
  config: CollectionConfiguration,
  readonlyMode: boolean,
  filteredTools: string[]
) => {
  return tools.forEach(tool => {
    // ... existing permission and readonly checks ...

    // Slice filtering using explicit slices array
    if (!isToolAllowedBySlices(tool.slices, config.enabledSlices, config.disabledSlices)) {
      return;
    }

    // ... rest of registration ...
  });
}
```

---

## Migration Strategy

### Phase 1: Infrastructure Updates
1. Update `ToolSliceName` type with all 28 slice names
2. Update `ToolDefinition` interface to add `slices: ToolSliceName[]`
3. Update `CreateUmbracoReadTool` and `CreateUmbracoWriteTool` to require `slices` parameter
4. Update `isToolAllowedBySlices` to use explicit slices instead of pattern matching

### Phase 2: Tool Migration (by collection)
Migrate tools collection by collection. Each tool file needs:
```typescript
// Before
const GetDocumentByIdTool = CreateUmbracoReadTool(
  "get-document-by-id",
  "Gets a document by id...",
  getDocumentByIdParams.shape,
  async ({ id }) => { /* handler */ },
  (user) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Read)
);

// After
const GetDocumentByIdTool = CreateUmbracoReadTool(
  "get-document-by-id",
  "Gets a document by id...",
  getDocumentByIdParams.shape,
  async ({ id }) => { /* handler */ },
  ['read'],  // NEW: Explicit slice assignment
  (user) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Read)
);
```

### Migration Order (suggested)
1. **data-type** (17 tools) - Good test case with CRUD, tree, folders
2. **document** (40 tools) - Complex collection with publish, recycle-bin
3. **media** (25 tools) - Similar to document
4. **Remaining collections** alphabetically

### Phase 3: Cleanup
1. Remove pattern-matching code from `slice-matcher.ts`
2. Remove `slice-registry.ts` pattern definitions
3. Update documentation

---

## Files to Modify

| File | Change |
|------|--------|
| `src/types/tool-definition.ts` | Add `ToolSliceName` type and `slices` property |
| `src/helpers/mcp/create-umbraco-tool.ts` | Add `slices` parameter to factory functions |
| `src/umb-management-api/tools/tool-factory.ts` | Update `isToolAllowedBySlices` to use explicit slices |
| `src/helpers/config/slice-matcher.ts` | Simplify to only validate slice names |
| `src/umb-management-api/tools/slices/slice-registry.ts` | Keep for slice metadata, remove patterns |
| `src/umb-management-api/tools/*/` | Update all ~296 tool files to add slices parameter |

---

## Example Tool Slice Assignments

### CRUD Operations
```typescript
// create-document.ts
slices: ['create']

// get-document-by-id.ts
slices: ['read']

// update-document.ts
slices: ['update']

// delete-document.ts
slices: ['delete']

// delete-data-type-folder.ts (the bug case!)
slices: ['delete']  // No longer matches 'read' by accident
```

### Multi-Slice Tools
```typescript
// get-document-root.ts
slices: ['read', 'tree']  // Both read (fetches data) and tree (navigation)

// get-document-configuration.ts
slices: ['read', 'configuration']  // Both read and configuration
```

### Always-Included Tools
```typescript
// get-server-information.ts
slices: []  // Empty = never filtered by slice config
```

---

## Testing Strategy

1. **Unit tests** for `isToolAllowedBySlices` with explicit arrays
2. **Compilation tests** - TypeScript will catch invalid slice names
3. **Integration tests** - Verify filtering works with config
4. **Snapshot tests** - Verify each tool has correct slices assigned

---

## Benefits of This Approach

1. **No pattern matching ambiguity** - Each tool explicitly declares its slices
2. **Compile-time safety** - TypeScript enforces valid slice names
3. **Self-documenting** - Reading a tool file tells you exactly what slices it belongs to
4. **Multi-slice support** - Tools can belong to multiple slices
5. **Always-included option** - Empty array means tool is never slice-filtered
6. **Testable** - Unit tests can verify slice assignments directly
7. **Explicit over implicit** - Aligns with project philosophy

---

## Open Questions

1. Should we add slice metadata (displayName, description) for documentation?
2. Should slices be validated at startup (warn on unknown slice names)?
3. Should we generate a tool-to-slice mapping report for documentation?

---

## Recommended Implementation Order

### Phase 1: Infrastructure (can be done first, backward compatible)
1. Add `ToolSliceName` type to `src/types/tool-definition.ts`
2. Add `slices` property to `ToolDefinition` interface
3. Update `CreateUmbracoReadTool` and `CreateUmbracoWriteTool` signatures
4. Update `isToolAllowedBySlices` in tool-factory.ts to use explicit slices

### Phase 2: Tool Migration (big bang, all tools at once)
Update all ~296 tool files to add explicit `slices` parameter.

**Suggested migration script approach:**
- Generate a mapping file from current pattern matching
- Use AST transformation or regex to add slices to each tool
- Review and manually adjust edge cases

### Phase 3: Cleanup
1. Remove pattern matching code from `slice-matcher.ts`
2. Simplify `slice-registry.ts` to just metadata (no patterns)
3. Update tests to verify explicit assignments
4. Update documentation

---

## Estimated Effort

| Phase | Effort | Risk |
|-------|--------|------|
| Infrastructure | 2-4 hours | Low |
| Tool Migration | 4-8 hours | Medium (need careful review) |
| Cleanup | 1-2 hours | Low |
| Testing | 2-4 hours | Low |

**Total: 1-2 days**

---

## Configuration (unchanged)

```bash
# Environment variables
UMBRACO_INCLUDE_SLICES=create,read,tree
UMBRACO_EXCLUDE_SLICES=delete,recycle-bin

# CLI arguments
--umbraco-include-slices=create,read,update
--umbraco-exclude-slices=delete
```

---

## Current Slice Counts (for reference)

| Slice | Count | Category |
|-------|-------|----------|
| create | 27 | CRUD |
| read | 25 | CRUD |
| update | 23 | CRUD |
| delete | 28 | CRUD |
| tree | 42 | Navigation |
| search | 6 | Query |
| list | 7 | Query |
| references | 15 | Query |
| publish | 4 | Workflow |
| recycle-bin | 12 | Workflow |
| move | 7 | Workflow |
| copy | 5 | Workflow |
| sort | 2 | Workflow |
| validate | 5 | Workflow |
| rename | 3 | Workflow |
| configuration | 12 | Information |
| audit | 2 | Information |
| urls | 5 | Information |
| permissions | 3 | Information |
| user-status | 5 | Information |
| current-user | 4 | Information |
| notifications | 2 | Entity Mgmt |
| public-access | 4 | Entity Mgmt |
| scaffolding | 11 | Entity Mgmt |
| blueprints | 3 | Entity Mgmt |
| server-info | 4 | System |
| diagnostics | 14 | System |
| templates | 8 | System |
| **other/unsliced** | **~16** | Always included (empty array) |

---

## Document Location

This plan should be saved to: `docs/explicit-slice-refactoring-plan.md`
