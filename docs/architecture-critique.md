# Architecture & Structure Critique: Umbraco MCP Server

## Executive Summary

This is a **well-architected, production-ready codebase** with strong patterns established. However, there are several code smells and structural inconsistencies worth addressing. The issues fall into three categories: **Unnecessary Complexity**, **Inconsistent Patterns**, and **Missing Abstractions**.

---

## Code Smells & Issues

### 1. Remove Resources Entirely

**Decision:** Remove the resources pattern - tools are sufficient and better designed. (No prompts are implemented.)

**Files to delete:**
- `src/helpers/mcp/create-umbraco-template-resource.ts`
- `src/helpers/mcp/create-umbraco-read-resource.ts`
- `src/umb-management-api/resources/` (entire directory)
- `src/types/resource-definition.ts`
- `src/types/resource-template-definition.ts`

**Files to update:**
- `src/index.ts` - Remove `ResourceFactory` call
- Any references to resources in documentation

**Why:**
- Tools handle all the same use cases (GET requests are just tools with `readOnlyHint: true`)
- Resources add a separate pattern with double-factory complexity
- Tools have better established patterns, testing infrastructure, and consistent organization
- Simplifies the codebase by having one way to expose functionality

**Impact:** Reduces cognitive load, removes ~200+ lines of unnecessary abstraction.

---

### 2. Missing Index Files in Helper Directories

**Evidence:**

```
src/helpers/mcp/           - NO index.ts (5 files, no barrel)
src/helpers/config/        - NO index.ts (5 files, no barrel)
src/helpers/auth/          - NO index.ts (1 file, no barrel)
src/test-helpers/          - HAS index.ts (barrel file exists)
```

**The Problem:**

Forces verbose, per-file imports:

```typescript
// Current (verbose)
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { executeGetApiCall } from "@/helpers/mcp/api-call-helpers.js";
import { CollectionConfigLoader } from "@/helpers/config/collection-config-loader.js";
import { validateSliceNames } from "@/helpers/config/slice-matcher.js";

// Expected (with index.ts)
import { withStandardDecorators, executeGetApiCall } from "@/helpers/mcp";
import { CollectionConfigLoader, validateSliceNames } from "@/helpers/config";
```

**Impact:** Inconsistent import patterns, harder to refactor module boundaries.

---

### 3. Standardize on Object Pattern for Static Utilities

**Decision:** Use the object pattern (like `AuthorizationPolicies`) consistently. Convert classes with static methods to objects.

**Files to update:**
- `src/helpers/config/collection-config-loader.ts` - Convert from class to object

**Before:**
```typescript
// Class with static methods (collection-config-loader.ts)
export class CollectionConfigLoader {
  static loadFromConfig(config: UmbracoServerConfig): CollectionConfiguration {
    // ...implementation
  }
}
```

**After:**
```typescript
// Object with methods (consistent with AuthorizationPolicies)
export const CollectionConfigLoader = {
  loadFromConfig: (config: UmbracoServerConfig): CollectionConfiguration => {
    // ...implementation
  }
};
```

**Why object pattern:**
- Simpler syntax, less boilerplate
- No `this` binding issues
- Consistent with existing `AuthorizationPolicies` pattern
- Tree-shakeable (individual methods can be imported if needed)

**Test verification:**

Existing tests (no changes needed - call syntax identical):
- `collection-config-loader-modes.test.ts` - 12 tests covering mode expansion, validation, merging
- `collection-filtering.test.ts` - 16 tests covering dependency resolution, filtering, config loading

All tests use `CollectionConfigLoader.loadFromConfig(serverConfig)` - this call syntax works identically for both class and object patterns.

**Impact:** Consistent conventions across the codebase. Tests pass without modification.

---

### 4. Split Tool Factory into Focused Modules

**Current file:** `src/umb-management-api/tools/tool-factory.ts` (183 lines)

**Decision:** Split into 4 focused files with clear responsibilities.

**Proposed structure:**
```
src/umb-management-api/tools/
├── tool-factory.ts              # Main orchestrator (slim, ~30 lines)
├── collection-registry.ts       # Available collections array + imports
├── collection-resolver.ts       # Dependency resolution + filtering
└── tool-registrar.ts            # Tool filtering + registration logic
```

**File 1: `collection-registry.ts`** (Collection definitions)
```typescript
import { DataTypeCollection } from "./data-type/index.js";
import { DocumentCollection } from "./document/index.js";
import { DocumentTypeCollection } from "./document-type/index.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const availableCollections: ToolCollectionExport[] = [
  DataTypeCollection,
  DocumentCollection,
  DocumentTypeCollection,
];
```

**File 2: `collection-resolver.ts`** (Collection filtering & dependencies)
```typescript
// Using object pattern (consistent with AuthorizationPolicies)
export const CollectionResolver = {
  resolveDependencies: (requestedNames, collections) => { ... },
  getEnabledCollections: (config, collections) => { ... },
  validateConfiguration: (config, collections) => { ... },
};
```

**File 3: `tool-registrar.ts`** (Tool filtering & registration)
```typescript
export const ToolRegistrar = {
  isToolAllowedBySlices: (toolSlices, enabledSlices, disabledSlices) => { ... },
  registerTools: (server, user, tools, config, readonlyMode, filteredTools) => { ... },
};
```

**File 4: `tool-factory.ts`** (Slim orchestrator)
```typescript
import { availableCollections } from "./collection-registry.js";
import { CollectionResolver } from "./collection-resolver.js";
import { ToolRegistrar } from "./tool-registrar.js";

export function UmbracoToolFactory(server, user, serverConfig) {
  const config = CollectionConfigLoader.loadFromConfig(serverConfig);
  const readonlyMode = serverConfig.readonly ?? false;
  const filteredTools: string[] = [];

  CollectionResolver.validateConfiguration(config, availableCollections);
  const enabledCollections = CollectionResolver.getEnabledCollections(config, availableCollections);

  enabledCollections.forEach(collection => {
    const tools = collection.tools(user);
    ToolRegistrar.registerTools(server, user, tools, config, readonlyMode, filteredTools);
  });

  if (readonlyMode && filteredTools.length > 0) {
    console.log(`\nReadonly mode: Disabled ${filteredTools.length} write tools:`);
  }
}
```

**Test verification:**
- Existing `tool-factory-integration.test.ts` (~50 tests) continues to work unchanged
- New files can have focused unit tests for individual functions
- `CollectionResolver` and `ToolRegistrar` become independently testable

**Why split:**
- Single responsibility per file
- Each piece testable in isolation
- Easy to find where to add new collections (registry)
- Clear separation: collections vs resolution vs registration

**Impact:** Better maintainability, easier testing, clearer code organization.

---

### 5. Remove Legacy Format Handling from createSnapshotResult

**File:** `src/test-helpers/create-snapshot-result.ts`

**The Problem:**

The `createSnapshotResult` helper contains ~30 lines of legacy format handling for `content[0].text` responses:

```typescript
// Legacy format: handle content[0].text with JSON strings
if (!result?.content) {
  return result;
}
// ... 30 more lines for legacy handling
```

However, all tools now use `structuredContent`. The legacy handling is dead code - only tested but never used in actual tests.

**Action:** Remove the legacy format handling code. Keep only the `structuredContent` path.

**Impact:** Low effort cleanup. Removes ~30 lines of unused code.

---

## Architectural Strengths to Preserve

1. **Consistent tool definition pattern** - All tools use the same structure
2. **Decorator composition** - `withStandardDecorators()` cleanly wraps all tools
3. **API call helpers** - 196+ tools use `executeGetApiCall`/`executeVoidApiCall`
4. **Builder pattern for tests** - Well-implemented fluent builders
5. **Type safety** - Full TypeScript with Zod validation throughout
6. **Feature-slice organization** - Tests co-located with implementations

---

## Summary by Impact

| Issue | Severity | Effort to Fix |
|-------|----------|---------------|
| Missing index.ts files | Low | Low |
| Standardize on object pattern | Low | Low |
| Remove resources entirely | Medium | Low |
| Remove legacy format handling | Low | Low |
| Split tool factory into modules | Medium | Medium |
