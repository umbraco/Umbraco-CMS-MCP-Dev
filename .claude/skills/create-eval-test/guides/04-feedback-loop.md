# Closed Feedback Loop: Using Evals to Improve Tools

🔄 **This is the most important concept**: Eval tests aren't just for testing - they're a feedback mechanism for improving the tools themselves!

## The Self-Improvement Cycle

```
┌─────────────────────────────────────────────────┐
│  1. Write eval test with verbose mode          │
│     - Document expected workflow                │
│     - Run with real LLM                         │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  2. Discover tool issues through verbose output │
│     - Empty/void responses                      │
│     - Missing IDs                               │
│     - Unclear error messages                    │
│     - Confusing response structures             │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  3. Improve the tools to be LLM-friendly       │
│     - Return IDs in create responses            │
│     - Add structured error details              │
│     - Include helpful context                   │
│     - Make responses consistent                 │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  4. Update eval test and verify improvements   │
│     - Simplify prompt (less workarounds needed) │
│     - Test passes more reliably                 │
│     - LLM performs better                       │
└──────────────────┬──────────────────────────────┘
                   ↓
                 Repeat
```

## What to Look For in Verbose Output

When you spot these patterns, consider **improving the tool** instead of working around it in the prompt:

### 1. Tool Returns Void When It Should Return ID

**What you see:**
```
[TOOL RESULT]
  [{ "type": "text", "text": "" }]  // After create operation
```

**Tool improvement opportunity:**
```typescript
// ❌ Current: Returns void
return createToolResult();  // Empty

// ✅ Better: Return the created entity ID
return createToolResult({
  message: "Document created successfully",
  id: createdDocumentId
});
```

**Impact**:
- LLM no longer needs to search after every create
- Fewer API calls (more efficient)
- More straightforward workflow
- Clearer user experience

### 2. Generic Error Messages

**What you see:**
```
[TOOL RESULT]
  "Error: Unknown error"
```

**Tool improvement opportunity:**
```typescript
// ❌ Current: Generic error
return createToolResultError({ message: "Unknown error" });

// ✅ Better: Specific error details
return createToolResultError({
  message: "Failed to create member",
  detail: "Username 'testuser' already exists",
  status: 409,
  errors: {
    username: ["Must be unique"]
  }
});
```

**Impact**:
- LLM can understand what went wrong
- Can suggest fixes or retry with different data
- Better error recovery
- Improved eval test diagnostics

### 3. Inconsistent Response Structures

**What you see:**
```
// create-member returns:
{"message": "Created", "id": "abc"}

// create-document returns:
{"success": true, "documentId": "xyz"}

// create-data-type returns:
[{ "type": "text", "text": "" }]
```

**Tool improvement opportunity:**

Standardize all create responses:
```typescript
// ✅ Consistent pattern for ALL creates
export const standardCreateResponse = z.object({
  message: z.string(),
  id: z.string().uuid()
});

// Every create tool returns the same structure
return createToolResult({
  message: "Entity created successfully",
  id: createdId
});
```

**Impact**:
- LLM learns one pattern, applies everywhere
- Prompts can be more generic
- Easier to create new eval tests
- Consistent user experience

### 4. Missing Context in Responses

**What you see:**
```
[TOOL RESULT]
  {"id": "abc-123"}  // Just an ID, no context
```

**Tool improvement opportunity:**
```typescript
// ❌ Minimal response
return createToolResult({ id: createdId });

// ✅ Rich response with context
return createToolResult({
  message: "Member created successfully",
  id: createdId,
  name: memberData.name,
  email: memberData.email,
  memberType: memberData.memberType
});
```

**Impact**:
- LLM can verify creation was correct
- Can display confirmation to user
- Can catch mistakes early
- Better debugging experience

## How to Document Tool Improvements Needed

When you spot a tool that needs improvement during eval testing:

### 1. Document the issue in verbose output comments

```typescript
// 🔧 TOOL IMPROVEMENT NEEDED
// create-document returns void, forcing LLM to search
// Consider: Return document ID in response
```

### 2. Create an issue or TODO

```typescript
// TODO: Improve create-document response
// Current: [{"type":"text","text":""}]
// Desired: {"message":"Document created","id":"abc-123"}
// Reason: Reduces API calls, clearer workflow
```

### 3. Update the tool

```typescript
// Before: Void response
return createToolResult();

// After: Structured response with ID
return createToolResult({
  message: "Document created successfully",
  id: createdId
});
```

### 4. Update and rerun eval test

```typescript
// Prompt can now be simpler:
// Before:
prompt: `
- Create document
- Search for document to get ID
- Use ID for operations
`

// After tool improvement:
prompt: `
- Create document (will return ID)
- Use returned ID for operations
`
```

### 5. Measure improvement

- Fewer tool calls needed? ✅
- Test runs faster? ✅
- Prompt is simpler? ✅
- LLM performs better? ✅

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

**Action**: Update document create tool to return ID like member create does.

## Benefits of the Feedback Loop

1. **Better Tools**: Each eval test makes tools more LLM-friendly
2. **Simpler Prompts**: Less workarounds needed as tools improve
3. **Faster Tests**: Fewer redundant API calls
4. **Better UX**: Improvements benefit both LLMs and human users
5. **Self-Documenting**: Eval tests document expected behavior
6. **Quality Assurance**: Catch regressions when tools change
7. **Continuous Improvement**: Every test run can reveal improvements

## Prioritizing Tool Improvements

Focus on improvements that:

1. **Reduce API calls** - Return IDs instead of forcing searches
2. **Clarify errors** - Specific messages over "Unknown error"
3. **Add consistency** - Same patterns across all tools
4. **Provide context** - Rich responses over minimal data
5. **Enable recovery** - Clear errors that LLM can act on

## Example Improvement Workflow

### Step 1: Discover Issue
```
[TOOL RESULT]
  [{"type":"text","text":""}]  // No ID after create
```

### Step 2: Document Workaround in Eval Test
```typescript
prompt: `
- Create document
- Search for document to get ID (create doesn't return ID)
`
```

### Step 3: File Tool Improvement
```typescript
// src/umb-management-api/tools/document/post/create-document.ts
// TODO: Return created document ID in response
```

### Step 4: Implement Improvement
```typescript
// Before
return createToolResult();

// After
return createToolResult({
  message: "Document created successfully",
  id: createdId
});
```

### Step 5: Update Eval Test
```typescript
// Simplified prompt - no workaround needed!
prompt: `
- Create document (will return ID)
- Use returned ID for update
`
```

### Step 6: Rebuild and Verify
```bash
npm run build
npm test -- tests/evals/document-lifecycle.test.ts
```

Test should:
- ✅ Pass more reliably
- ✅ Run faster (fewer API calls)
- ✅ Have simpler prompt
- ✅ Be easier to understand

## The Ultimate Goal

**Every eval test should leave the codebase better than it found it.**

When you write an eval test and discover issues:
1. Fix the test (workaround)
2. Document the tool improvement
3. Implement the improvement
4. Simplify the test
5. Both test AND tool are now better

This is **continuous improvement in action**! 🔄✨
