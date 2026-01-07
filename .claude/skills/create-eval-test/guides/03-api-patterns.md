# API Response Patterns and Edge Cases

Complete guide to handling different API response patterns in your eval tests.

## Critical Edge Case: Create Doesn't Return Usable ID

**Symptom in verbose output:**
```
[ASSISTANT]
  Tool call: create-document
  Input: { "name": "Test Doc", ... }

[TOOL RESULT]
  [{ "type": "text", "text": "" }]  // 🚨 Empty response, no ID!

[ASSISTANT]
  Tool call: update-document
  Input: { "id": "???" }  // 🚨 LLM doesn't have the ID!

[TOOL RESULT]
  Error: Invalid ID
```

**Common causes:**
- Some Umbraco API endpoints return void/empty responses after create
- The ID must be obtained through a separate search/find operation
- The create response doesn't include the ID in an accessible format

**How to spot this:**
Look in verbose output for create operations that return:
- Empty text: `[{ "type": "text", "text": "" }]`
- Success message without ID: `{"message": "Created successfully"}`
- Void response: `[]`

**How to fix:**
Tell the LLM to find/search for the entity immediately after creation:

```typescript
// ❌ Wrong - assumes create returns ID
prompt: `
- Create a document with name "Test Doc {timestamp}"
- Update the document using the ID from the create result
`

// ✅ Correct - explicitly search for entity after create
prompt: `
- Create a document with name "Test Doc {timestamp}"
- IMPORTANT: Some create operations don't return the entity ID
- Immediately find the created document by searching for the name "Test Doc {timestamp}"
- Extract the ID from the find result
- Use that ID for all subsequent operations (update, delete)
`
```

**Real-world example from this project:**

Many Umbraco tools return void responses. Check the tool implementation:

```typescript
// Example: Document create returns void
const result = await CreateDocumentTool.handler(...);
// result = [{ "type": "text", "text": "" }]  // No ID!

// Must search to get ID:
const searchResult = await FindDocumentTool.handler({ filter: "Test Doc" });
const documentId = searchResult.items[0].id;
```

**Pattern to use in prompts:**

```typescript
prompt: `
1. Create entity with UNIQUE NAME using the timestamp: "Test Entity {timestamp}"
2. Because create may not return an ID, immediately search/find the entity by that exact name
3. Extract the entity ID from the search result
4. Store this ID - you'll need it for update and delete operations
5. Update the entity using the ID you found
6. Delete the entity using the same ID
`
```

**Why this matters:**
- This is a VERY common pattern in Umbraco Management API
- If you don't document this in the prompt, the test will fail
- The LLM has no way to know it needs to search unless you tell it
- Verbose mode will show you when this happens

## API Response Patterns to Watch For

When reviewing verbose output, be alert for these patterns:

### 1. Void/Empty Responses After Create

```
[TOOL RESULT]
  [{ "type": "text", "text": "" }]
```

**Action**: Add explicit search/find step after creation in your prompt.

### 2. ID in Location Header (Response Body Includes ID)

```
[TOOL RESULT]
  {"message":"Member created successfully","id":"abc-123"}
```

**Action**: This is good! The tool extracts the ID. LLM can use it directly.

### 3. Structured Data Without Top-Level ID

```
[TOOL RESULT]
  {"variants":[{"name":"Test"}],"values":[],"memberType":{"id":"..."}}
```

**Action**: May need to tell LLM where the relevant ID is (e.g., in memberType, not at root level).

### 4. Search Returns Multiple Results

```
[TOOL RESULT]
  {"total":5,"items":[...]}
```

**Action**: Tell LLM to search with unique name and take the first result, or filter by exact match.

### 5. Success With Warning Messages

```
[TOOL RESULT]
  {"message":"Created with warnings","warnings":["..."]}
```

**Action**: Test should handle this as success unless warnings are critical.

## Determining Which Pattern to Use

**How to know if you need the "search after create" pattern:**

1. **Check verbose output on first run**:
   - If create returns `{"message":"...","id":"..."}` ✅ - ID is available, use it directly
   - If create returns `[{"type":"text","text":""}]` ⚠️ - No ID, must search after create
   - If create returns `{}` or null ⚠️ - No ID, must search after create

2. **Check the tool implementation** (if unsure):
   ```typescript
   // Look at src/umb-management-api/tools/{entity}/post/create-{entity}.ts
   // Check the return type and response handling
   ```

3. **General rule of thumb**:
   - **Member, Member Type, User**: Usually return ID directly ✅
   - **Document, Media, Data Type**: Often return void/empty ⚠️ (must search)
   - **When in doubt**: Always use the "search after create" pattern - it's safer

**Pro tip**: Structure your prompts to work with BOTH patterns:

```typescript
prompt: `
- Create entity with unique name "Test Entity {timestamp}"
- If the create result includes an ID, use it
- If the create result is empty or doesn't include an ID, search for "Test Entity {timestamp}" to get the ID
- Use the ID (from either source) for subsequent operations
`
```

This makes your test robust to both response types!

## Real-World Example: Member Create vs Document Create

**Member Create** (good example):
```
[TOOL RESULT]
  {"message":"Member created successfully","id":"14fe76f3-f6a6-4bb5-a367-7a73c6d52099"}
```
✅ Returns ID directly - LLM can continue workflow immediately

**Document Create** (improvement needed):
```
[TOOL RESULT]
  [{"type":"text","text":""}]
```
⚠️ No ID - LLM must search - Extra API call - Slower workflow

**Action**: Update document create tool to return ID like member create does (see [Feedback Loop guide](./04-feedback-loop.md)).

## Common API Patterns

### Empty Response = Success

Many update and delete operations return empty responses:

```
[TOOL RESULT]
  [{ "type": "text", "text": "" }]
```

This is **normal and indicates success**. Tell the LLM:

```typescript
prompt: `
- Update operations may return empty responses - this is normal and indicates success
- Don't be concerned if update/delete returns [{"type":"text","text":""}]
`
```

### Hierarchical IDs

Some entities need parent IDs:

```typescript
prompt: `
- Get the root document ID first
- Create the new document with parent: { "id": "<root ID>" }
`
```

### Nested Results

Some results have data nested in properties:

```
[TOOL RESULT]
  {"items":[...], "total":5}
```

Tell the LLM where to find the data:

```typescript
prompt: `
- The search result will have an "items" array
- Extract the first item from result.items
- Get the ID from items[0].id
`
```

## Edge Cases to Document

When you discover an edge case during testing:

1. **Document it in the prompt** with explicit instructions
2. **Consider if the tool should be improved** (see [Feedback Loop](./04-feedback-loop.md))
3. **Add it to this guide** so future tests can reference it
4. **Test it 3 times** to ensure your workaround is reliable
