# Prompt Patterns for Eval Tests

Complete guide to writing effective prompts that guide the LLM through complex workflows.

## Critical Rules for Prompts

### 1. Always Use Unique Identifiers

**❌ WRONG:**
```typescript
prompt: `Create a member with email "test@example.com"`
```

**✅ CORRECT:**
```typescript
prompt: `Complete these tasks in order using a unique identifier for this test run:
- Generate a unique test identifier using current timestamp (e.g., Date.now())
- Create a member with email "test.eval.{timestamp}@example.com" (replace {timestamp} with unique identifier)
- Create with username "test_eval_{timestamp}" (replace {timestamp} with unique identifier)`
```

**Why**: Prevents conflicts with existing data from previous test runs.

### 2. Search for IDs, Don't Hardcode

**❌ WRONG:**
```typescript
prompt: `Create a member with memberType: { "id": "d59be02f-1df9-4228-aa1e-01917d806cda" }`
```

**✅ CORRECT:**
```typescript
prompt: `Complete these tasks in order:
- Search for member types using search-member-type-items with query "Member" to find the default member type
- Create a new member using the member type ID from the search result:
  - memberType: { "id": "<use the ID from search result>" }`
```

**Why**: Makes tests more robust and demonstrates proper tool usage.

### 3. Provide Clear Step-by-Step Instructions

**❌ WRONG:**
```typescript
prompt: `Create, update, and delete a member`
```

**✅ CORRECT:**
```typescript
prompt: `Complete these tasks in order:
- Step 1: Search for member types using search-member-type-items with query "Member"
- Step 2: Create a new member using the member type ID from the search result:
  - email: "test.eval.{timestamp}@example.com"
  - username: "test_eval_{timestamp}"
  - password: "TestPass123!@#" (must be at least 10 characters with number and symbol)
  - memberType: { "id": "<use the ID from search result>" }
  - isApproved: true
  - variants: [{ "name": "_Test Member Eval {timestamp}", "culture": null, "segment": null }]
  - values: [] (empty array - no additional values needed for default member type)
- Step 3: Find the newly created member by searching with find-member using the username you created
- Step 4: Get the full member details using get-member with the member ID from the find result
- Step 5: Update the member using update-member to change the name in variants to "_Test Member Eval Updated"
- Step 6: Delete the member using delete-member with the member ID
- Step 7: Try to find the member again using find-member to verify deletion (this should return no results)
- When all tasks complete, say 'The member management workflow has completed successfully'`
```

### 4. Include Specific Field Requirements

When creating entities, specify ALL required fields with their exact structure:

```typescript
prompt: `Create a member with these details:
  - email: "test.eval.{timestamp}@example.com"
  - username: "test_eval_{timestamp}"
  - password: "TestPass123!@#" (must be at least 10 characters with number and symbol)
  - memberType: { "id": "<use the ID from search result>" }
  - isApproved: true
  - variants: [{ "name": "_Test Member Eval {timestamp}", "culture": null, "segment": null }]
  - values: [] (empty array - no additional values needed)`
```

### 5. Test the Full CRUD Lifecycle

A good eval test should cover:
1. **Search/Discovery** - Find necessary IDs (types, parents, etc.)
2. **Create** - Create the entity with unique identifiers
3. **Find** - Search for the created entity to verify creation
4. **Read** - Get full details of the entity
5. **Update** - Modify the entity
6. **Verify** - Optional validation or reference checks
7. **Delete** - Remove the entity
8. **Verify Deletion** - Confirm the entity is gone

## Patterns to Always Include

Based on API behavior, ALWAYS include these patterns:

### 1. After Create, Always Search

```typescript
prompt: `
- Create entity with unique name "Test Entity {timestamp}"
- Immediately find/search for the entity by that exact name
- Extract the entity ID from the search result
`
```

### 2. Use Exact Name Matching

```typescript
prompt: `
- Search for the entity using the EXACT name you created: "Test Entity {timestamp}"
- Take the first result from the search (should be only one due to unique timestamp)
`
```

### 3. Store IDs for Later Use

```typescript
prompt: `
- Once you have the entity ID, store it
- Use this SAME ID for all subsequent operations (update, delete)
- Don't search again unless necessary
`
```

### 4. Handle Empty Responses

```typescript
prompt: `
- Update operations may return empty responses - this is normal and indicates success
- Don't be concerned if update/delete returns [{"type":"text","text":""}]
`
```

### 5. Verify Deletion

```typescript
prompt: `
- After delete, search again to verify the entity no longer exists
- The search should return {"total":0,"items":[]}
`
```

## Adaptive Pattern for API Variations

Make your prompts work with BOTH return-ID and void response patterns:

```typescript
prompt: `
- Create entity with unique name "Test Entity {timestamp}"
- If the create result includes an ID, use it
- If the create result is empty or doesn't include an ID, search for "Test Entity {timestamp}" to get the ID
- Use the ID (from either source) for subsequent operations
`
```

This makes your test robust to API changes!

## Common Prompt Mistakes

1. ❌ Hardcoding IDs instead of searching for them
2. ❌ Using non-unique identifiers (will conflict with previous runs)
3. ❌ Vague prompts without step-by-step instructions
4. ❌ Missing required fields in create operations
5. ❌ Not specifying the exact data structure needed
6. ❌ Too many steps in one test (keep it focused)
7. ❌ Not including cleanup/deletion steps
8. ❌ Not verifying the workflow completed successfully
9. ❌ Assuming LLM will infer what you mean
10. ❌ Not telling LLM to reuse previous results
