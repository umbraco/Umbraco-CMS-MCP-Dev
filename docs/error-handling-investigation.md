# Error Handling Investigation Results

## Summary

Investigation into "unknown error" messages in eval tests revealed that **error handling is working correctly** at the tool level, but the Agent SDK simplifies structured error responses to plain text for the AI.

## Key Findings

### 1. Tools Return Proper ProblemDetails Format ✅

All error paths return structured errors with the ProblemDetails format:

```json
{
  "content": [],
  "structuredContent": {
    "type": "Error",
    "title": "Duplicate alias",
    "status": 400,
    "detail": "The specified document type alias is already in use",
    "operationStatus": "DuplicateAlias"
  },
  "isError": true
}
```

### 2. Agent SDK Limitation

The Agent SDK simplifies error responses to plain text like `"Error: Unknown error"` when passing them to the AI. The `structuredContent` field is not exposed to the AI - this is an SDK limitation, not a bug in our code.

**What the AI sees:**
```json
{
  "type": "tool_result",
  "content": "Unknown error",
  "is_error": true
}
```

**What the tool actually returns:**
```json
{
  "content": [],
  "structuredContent": {
    "type": "Error",
    "title": "Unknown error. Please see the log for more details.",
    "status": 500,
    "operationStatus": "Unknown"
  },
  "isError": true
}
```

### 3. Two Layers of Validation

The system has two validation layers, both returning proper ProblemDetails:

#### Client-Side (Zod Validation)
Catches invalid input before calling Umbraco API:

```json
{
  "type": "Error",
  "title": "ZodError",
  "detail": "[{\"code\":\"too_small\",\"minimum\":1,\"path\":[\"alias\"],\"message\":\"Alias is required\"}]",
  "status": 500
}
```

#### Server-Side (Umbraco API Validation)
Business logic validation from Umbraco:

```json
{
  "type": "Error",
  "title": "Duplicate alias",
  "status": 400,
  "detail": "The specified document type alias is already in use",
  "operationStatus": "DuplicateAlias"
}
```

## Error Types Observed

### 1. Not Found Errors (500)
When operating on non-existent entities:
- **title**: "Unknown error. Please see the log for more details."
- **status**: 500
- **operationStatus**: "Unknown"

### 2. Duplicate Errors (400)
When creating entities with duplicate identifiers:
- **title**: "Duplicate alias"
- **status**: 400
- **detail**: "The specified document type alias is already in use"
- **operationStatus**: "DuplicateAlias"

### 3. Validation Errors (500)
When Zod schema validation fails:
- **title**: "ZodError"
- **status**: 500
- **detail**: JSON array of validation errors with path and message

## Fix Applied

Updated `src/helpers/mcp/tool-decorators.ts` to ensure ALL error paths return proper ProblemDetails format:

### Before (Simplified Format)
```typescript
// Standard Error
if (error instanceof Error) {
  return createToolResultError({
    message: error.message,
    name: error.name
  });
}
```

### After (ProblemDetails Format)
```typescript
// Standard Error - convert to ProblemDetails format
if (error instanceof Error) {
  return createToolResultError({
    type: "Error",
    title: error.name || "Error",
    detail: error.message,
    status: 500
  });
}
```

## Eval Tests Created

Created comprehensive error handling eval tests in `tests/evals/error-handling.test.ts`:

1. **Non-existent entity error** - Update member with invalid ID
2. **Duplicate entity error** - Create duplicate dictionary item
3. **Validation failure error** - Delete non-existent folder
4. **Multiple error scenarios** - Combined workflow with multiple error types
5. **Zod validation error** - Create document type with empty alias
6. **Error recovery** - Fail with validation error, then succeed with valid data

## Conclusions

1. ✅ **Tools correctly return ProblemDetails** - All error paths now return structured errors
2. ⚠️ **Agent SDK limitation** - Structured content is not passed to the AI (SDK issue)
3. ✅ **Comprehensive validation** - Two-layer validation (client + server) works correctly
4. ✅ **Consistent error format** - All errors use the same ProblemDetails structure
5. ✅ **Test coverage** - Eval tests verify error handling in real AI agent scenarios

## Related Files

- `src/helpers/mcp/tool-decorators.ts` - Error handling decorator (fixed)
- `src/helpers/mcp/tool-result.ts` - Tool result creation helpers
- `src/helpers/mcp/api-call-helpers.ts` - API call execution and error handling
- `tests/evals/error-handling.test.ts` - Comprehensive error handling eval tests
