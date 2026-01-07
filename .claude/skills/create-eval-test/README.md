# Create Eval Test Skill

This skill provides comprehensive guidance for creating evaluation tests for MCP tools that measure an LLM's ability to use the Umbraco Management API correctly.

## Usage

Invoke this skill when you need to:
- Create new evaluation tests for MCP tool workflows
- Test LLM's ability to use tools correctly
- Validate tool naming and structure
- Create end-to-end workflow tests
- Measure tool usability for AI agents
- **Identify tool improvements through verbose output** 🔄
- **Create a feedback loop for continuous tool improvement**

## Key Patterns Documented

The skill covers:
- Eval test structure and organization (`tests/evals/`)
- Critical rules for writing effective prompts
- Unique identifier patterns to avoid test conflicts
- Dynamic ID discovery instead of hardcoding
- Clear step-by-step instructions for LLMs
- Full CRUD lifecycle testing patterns
- Tool name verification from source code
- Build process requirements
- **Testing routine and iterative improvement**
- **Verbose mode debugging** (`verbose: true`)
- **Identifying and fixing common issues**
- **Spotting LLM inefficiencies and failures**
- Common pitfalls and how to avoid them

## Prerequisites

Before creating eval tests:
1. Build the project (`npm run build`)
2. Verify tool names from source code
3. Understand the entity's CRUD operations

## 🔄 The Self-Improvement Cycle (Most Important!)

**Eval tests aren't just for testing - they're a feedback mechanism for improving tools!**

```
Write Eval Test → Discover Tool Issues → Improve Tools → Verify Improvements → Repeat
```

When running eval tests with verbose mode, you'll discover:
- Tools that return void when they should return IDs
- Generic error messages that should be specific
- Inconsistent response structures across tools
- Missing context in responses

**Each discovery is an opportunity to improve the tool**, making it better for both LLMs and human users!

## Iterative Development Process

**ALWAYS use verbose mode during development:**

```typescript
it("should [describe test]",
  runScenarioTest({
    // ...
    verbose: true,  // 🔍 Shows detailed tool calls and results
  }),
  180000
);
```

The verbose output helps you:
- Spot incorrect tool names immediately
- See exact API errors ("Unknown error" becomes clear)
- Identify when the LLM doesn't follow instructions
- Find inefficient tool usage (repeated calls)
- Debug missing required tools
- **Discover tool improvement opportunities** 🔧

**Iterative cycle:**
1. Write test with `verbose: true`
2. Run and read verbose output
3. Fix one issue at a time
4. Rebuild (`npm run build`)
5. Run again
6. Repeat until passing
7. Run 3 times to ensure consistency
8. **Optimize workflow** - Remove redundant calls
9. **Document any tool improvements needed**
10. Disable verbose for production
11. **🚫 Don't start next test until current test is 100% passing AND optimized**

## Success Criteria

A well-written eval test should:
- Use unique identifiers (timestamps) to avoid conflicts
- Search for IDs dynamically rather than hardcoding
- Provide clear, step-by-step instructions
- Test a complete workflow (create, read, update, delete)
- Include all required fields for operations
- Clean up created entities
- Verify the workflow completed successfully
- Pass consistently on multiple runs
- **Be optimized with no redundant tool calls** ⚠️
- **Be fully working before moving to the next test** ⚠️

## Reference Implementation

The member management eval test serves as the reference implementation:
- `tests/evals/member-management.test.ts`

## Related Skills

- `create-integration-tests` - For creating unit/integration tests (different from eval tests)
- `test-builder-helper-creator` - For creating test infrastructure (used by integration tests)
