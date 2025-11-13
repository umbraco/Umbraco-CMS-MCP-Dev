# Schema Flattening Rule for CLAUDE.md

> **Copy this section into `/Users/philw/Projects/umbraco-mcp/CLAUDE.md`**

---

## MCP Tool Schema Design: Flatten Nested Parent Objects

### Problem
LLMs stringify nested `parent` objects, breaking API validation:

```typescript
// ❌ LLM Bug: Stringifies nested objects
{ "name": "Item", "parent": "{\"id\": \"uuid\"}" }
{ "name": "File.js", "parent": "{\"path\": \"/Scripts\"}" }

// ✅ Expected by API
{ "name": "Item", "parent": { "id": "uuid" } }
{ "name": "File.js", "parent": { "path": "/Scripts" } }
```

### Solution: Flatten parent parameters

**Path-based (files):**
```typescript
// ✅ Flat path parameter
const schema = z.object({
  name: z.string(),
  path: z.string().optional()  // NOT parent: { path }
});

// Transform for API
const payload = {
  name: model.name,
  parent: model.path ? { path: model.path } : undefined
};
```

**ID-based (content):**
```typescript
// ✅ Flat parentId parameter
const schema = z.object({
  name: z.string(),
  parentId: z.string().uuid().optional()  // NOT parent: { id }
});

// Transform for API
const payload = {
  name: model.name,
  parent: model.parentId ? { id: model.parentId } : undefined
};
```

### When to Apply
**✅ ALWAYS flatten for high-frequency content:**
- **Path-based**: Scripts, Partial Views, Stylesheets
- **ID-based**: Documents, Media, Dictionary, Data Types, Document Types, Document Blueprints

**❌ NOT needed for:**
- Folder creation tools (administrative, infrequent)
- Type definitions (schema setup)

### Testing Requirement
**ALWAYS test with parent parameter** to catch stringification bugs:

```typescript
it("should create item with parent", async () => {
  const result = await CreateTool().handler({
    name: "Child",
    parentId: parentId  // or path: "/folder"
  }, { signal: new AbortController().signal });
  expect(result).toMatchSnapshot();
});
```

### Reference Implementations
- **Path-based**: `script/post/create-script.ts`, `partial-view/post/create-partial-view.ts`
- **ID-based**: `document/post/create-document.ts`, `dictionary/post/create-dictionary.ts`

### Quick Checklist
- [ ] Schema uses flat `path` or `parentId` (NOT nested `parent` object)
- [ ] Handler transforms flat param → `parent: { path/id }` for API
- [ ] Test exists for parent/folder scenario
- [ ] Tool description documents the parent parameter

---

**Why:** LLMs treat paths/IDs as simple parameters, not nested objects. Flattening prevents JSON stringification bugs in high-frequency workflows.
