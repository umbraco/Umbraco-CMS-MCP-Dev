# Debugging Routine and Iterative Development

Complete guide to using verbose mode, identifying issues, and iteratively improving your eval tests.

## Enable Verbose Mode for Debugging

**ALWAYS start with verbose mode enabled** when developing a new eval test:

```typescript
it("should create, update, and manage entity lifecycle",
  runScenarioTest({
    prompt: `...`,
    tools: ENTITY_TOOLS,
    requiredTools: ["create-entity", "update-entity", "delete-entity"],
    successPattern: "workflow has completed successfully",
    options: { maxTurns: 20 },
    verbose: true,  // 🔍 Enable verbose debugging
  }),
  180000
);
```

## What Verbose Mode Shows You

When `verbose: true`, you'll see detailed output for each step:

```
[ASSISTANT]
  I'll help you complete these tasks step by step.

[ASSISTANT]
  Tool call: create-member
  Input: {
    "email": "test.eval.1706884436543@example.com",
    "username": "test_eval_1706884436543",
    "password": "TestPass123!@#",
    ...
  }

[TOOL RESULT]
  {"message":"Member created successfully","id":"14fe76f3-f6a6-4bb5-a367-7a73c6d52099"}

[ASSISTANT]
  Step 3: Find the newly created member
```

## Iterative Improvement Process

Follow this cycle for each eval test:

1. **Write Initial Test** with `verbose: true`
2. **Run Test** and carefully read the verbose output
3. **Identify Issues**:
   - Wrong tool names?
   - API errors?
   - LLM not following instructions?
   - Missing required tools?
   - Inefficient pathways?
4. **Fix One Issue** at a time
5. **Rebuild**: `npm run build`
6. **Run Again** and verify the fix
7. **Repeat** until the test passes consistently
8. **Run 3 Times** to ensure consistency
9. **Disable Verbose** (set `verbose: false` or remove it) for production

## Debugging Common Issues

### 1. Tool Not Found

**Symptom in verbose output:**
```
[ASSISTANT]
  Tool call: get-item-member-type-search
  Input: { "query": "Member" }

[TOOL RESULT]
  Error: Tool 'get-item-member-type-search' not found
```

**How to fix:**
1. Check the actual tool name in source code
2. Look in `src/{api}/tools/{entity}/index.ts`
3. Update the tool name in your TOOLS array
4. Rebuild: `npm run build`

**Correct fix:**
```typescript
const TOOLS = [
  "search-member-type-items",  // ✅ Correct name from source
  // NOT: "get-item-member-type-search"  // ❌ Wrong assumption
];
```

### 2. "Unknown error" or API Errors

**Symptom in verbose output:**
```
[ASSISTANT]
  Tool call: create-member
  Input: {
    "email": "test@example.com",
    "username": "testuser",
    "password": "test123",
    "memberType": { "id": "..." }
  }

[TOOL RESULT]
  "Error: Unknown error"
```

**Common causes:**
- Missing required fields
- Wrong field structure
- Invalid data format
- Duplicate entity (username/email already exists)

**How to debug:**
1. Compare your input with the working unit test in `src/umb-management-api/tools/{entity}/__tests__/create-*.test.ts`
2. Check the builder pattern to see required fields
3. Look for validation errors in the tool's schema

**Example fix - Missing fields:**
```typescript
// ❌ Wrong - missing required fields
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "test123"
}

// ✅ Correct - all required fields
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "TestPass123!@#",
  "memberType": { "id": "d59be02f-1df9-4228-aa1e-01917d806cda" },
  "isApproved": true,
  "variants": [{ "name": "Test Member", "culture": null, "segment": null }],
  "values": []
}
```

**Example fix - Duplicate entity:**
```typescript
// ❌ Wrong - hardcoded identifier conflicts with previous runs
prompt: `Create a member with username "testuser"`

// ✅ Correct - unique identifier per run
prompt: `
- Generate a unique test identifier using current timestamp
- Create a member with username "test_eval_{timestamp}"
`
```

### 3. LLM Not Following Instructions

**Symptom in verbose output:**
```
[ASSISTANT]
  I'll create the member now.

[ASSISTANT]
  Tool call: create-member
  Input: {
    "username": "testuser",  // 🚨 Not using timestamp!
    ...
  }
```

**How to fix:**
Make your prompt MORE explicit and step-by-step:

```typescript
// ❌ Too vague
prompt: `Create a member with a unique username`

// ✅ Explicit and clear
prompt: `
- Generate a unique test identifier using current timestamp (e.g., Date.now())
- Create a member with these EXACT details:
  - username: "test_eval_{timestamp}" (replace {timestamp} with the unique identifier you generated)
  - Include the timestamp in the username to ensure uniqueness
`
```

### 4. Missing Required Tools

**Symptom in verbose output:**
```
Tools called: create-member, find-member
Missing required tools: update-member, delete-member
```

**How to fix:**
Make the prompt explicitly mention each required tool:

```typescript
// ❌ Vague - LLM might skip steps
prompt: `Create and manage a member`

// ✅ Explicit - mentions each required tool
prompt: `
- Create a new member using create-member
- Find the member using find-member
- Get full details using get-member
- Update the member using update-member
- Delete the member using delete-member
- Verify deletion by trying to find again
`
```

**Fix 1: Correct tool name**
- Check source: `src/umb-management-api/tools/member-type/index.ts`
- Update to: `search-member-type-items`
- Rebuild and run again

**Second run:**
```
[ASSISTANT]
  Tool call: search-member-type-items
  Input: { "query": "Member" }

[TOOL RESULT]
  {"items":[{"name":"Member","id":"d59be02f-1df9-4228-aa1e-01917d806cda"}],"total":1}

[ASSISTANT]
  Tool call: create-member
  Input: {
    "email": "test@example.com",  // 🚨 Not unique!
    ...
  }

[TOOL RESULT]
  "Error: Unknown error"
```

**Fix 2: Add unique identifiers**
- Update prompt to use timestamp
- Make email and username unique per run
- Rebuild and run again

**Third run:**
```
[ASSISTANT]
  Tool call: create-member
  Input: {
    "email": "test.eval.1706884436543@example.com",  // ✅ Unique!
    ...
  }

[TOOL RESULT]
  {"message":"Member created successfully","id":"14fe76f3-f6a6-4bb5-a367-7a73c6d52099"}

[ASSISTANT]
  The workflow has completed successfully
```

**Success!** ✅

## Production Checklist

Before committing your eval test:

### Correctness
- [ ] Test passes 3 times in a row
- [ ] All required tools are called
- [ ] Success pattern appears in result
- [ ] No hardcoded IDs (except constants)
- [ ] Unique identifiers used (timestamps)
- [ ] Tool names verified from source code
- [ ] Entities are cleaned up (deleted)

### Efficiency ⚠️
- [ ] **No redundant tool calls** - Review verbose output
- [ ] **IDs are reused** - Don't refetch data
- [ ] **Workflow is optimal** - Minimal API calls to achieve goal

### Quality
- [ ] Verbose mode disabled (or set to `false`)
- [ ] Test timeout is reasonable
- [ ] Instructions are clear and explicit
- [ ] Prompt guides LLM correctly

### 🚫 Do Not Move to Next Test Until
**Current test is 100% passing AND optimized!**

One solid test is better than multiple broken or inefficient tests.

## Common Issues Summary

- **Tool not found**: Check tool name spelling in source code, rebuild
- **"Unknown error"**: May indicate wrong field structure, missing required fields, or duplicate entity
- **Missing required tools**: Make the prompt explicitly mention each required tool
- **LLM not following instructions**: Make prompt MORE explicit with step numbers
- **Inefficient tool usage**: Tell LLM to reuse previous results, don't repeat calls
- **Inconsistent results**: Use unique identifiers (timestamps) for all test data
- **LLM can't find created entity**: Ensure unique name with timestamp, search by exact name
