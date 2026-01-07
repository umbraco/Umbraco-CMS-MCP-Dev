# Create Eval Test Skill

Create evaluation tests for MCP tools that measure an LLM's ability to use the Umbraco Management API tools correctly.

## 🎯 Core Philosophy

**Eval tests serve two purposes:**
1. **Test LLM performance** - Measure how well an LLM can use your tools
2. **Improve the tools themselves** - Use verbose output to discover and fix tool issues

**The key insight:** Every eval test creates a feedback loop. When you run a test with `verbose: true`, you'll discover:
- Tools that return void when they should return IDs
- Unclear error messages ("Unknown error" → specific details)
- Inconsistent response structures (standardize across tools)
- Missing required context in responses

**This makes eval tests a continuous improvement engine** - each test makes both the tools AND the tests better!

---

## Quick Start

### 1. Prerequisites

Before creating eval tests, you MUST:

**Build the project:**
```bash
npm run build
```

**Verify tool names from source:**
```bash
# Check actual tool names - they may differ from expectations!
cat src/umb-management-api/tools/{entity}/index.ts
```

### 2. Create Your Test File

Location: `tests/evals/your-feature-name.test.ts`

```typescript
import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "./helpers/index.js";

const YOUR_TOOLS = [
  "create-entity",
  "find-entity",
  "update-entity",
  "delete-entity"
] as const;

describe("your feature eval tests", () => {
  setupConsoleMock();

  it("should manage entity lifecycle",
    runScenarioTest({
      prompt: `[See Prompt Patterns guide]`,
      tools: YOUR_TOOLS,
      requiredTools: ["create-entity", "delete-entity"],
      successPattern: "workflow completed successfully",
      options: { maxTurns: 20 },
      verbose: true,  // ALWAYS enable during development
    }),
    180000
  );
});
```

### 3. Run and Iterate

```bash
npm run build  # Always rebuild before running
npm test -- tests/evals/your-feature-name.test.ts
```

Read the verbose output carefully - it shows you everything!

---

## 📚 Detailed Guides

Click to dive deep into each topic:

### [01. Prompt Patterns →](./guides/01-prompt-patterns.md)
**Learn how to write effective prompts**
- Always use unique identifiers (timestamps)
- Search for IDs dynamically, never hardcode
- Provide clear step-by-step instructions
- Specify exact field structures
- Test full CRUD lifecycle

### [02. Debugging Routine →](./guides/02-debugging-routine.md)
**Master iterative development with verbose mode**
- Enable `verbose: true` during development
- Identify 6 common issues and how to fix them
- Follow the iterative improvement cycle
- Use the production checklist
- Example debugging sessions

### [03. API Patterns →](./guides/03-api-patterns.md)
**Handle different API response patterns**
- Critical: Create operations that don't return IDs
- Void/empty responses and what they mean
- Determining which pattern to use
- Making prompts work with both patterns
- Real-world examples

### [04. Feedback Loop →](./guides/04-feedback-loop.md) 🔄
**Use evals to improve tools (Most Important!)**
- The self-improvement cycle
- What to look for in verbose output
- How to document tool improvements
- Prioritizing improvements
- Real before/after examples

### [05. Examples →](./guides/05-examples.md)
**Complete working examples**
- Member management (gold standard)
- Document with "search after create" pattern
- Minimal test structure
- Common test structures
- When to use each pattern

---

## Process Summary

### Step 1: Plan Your Test
1. Identify the workflow to test
2. List all tools needed
3. Determine required vs optional tools

### Step 2: Write the Test
1. Create test file in `tests/evals/`
2. Define tool array with grouped categories
3. Write clear, explicit prompt (see [Prompt Patterns](./guides/01-prompt-patterns.md))
4. Set `verbose: true`
5. Set reasonable maxTurns and timeout

### Step 3: Build and Run
```bash
npm run build
npm test -- tests/evals/your-test.test.ts
```

### Step 4: Debug and Iterate
1. Read verbose output carefully
2. Identify issues (see [Debugging Routine](./guides/02-debugging-routine.md))
3. Fix ONE issue at a time
4. Rebuild and run again
5. Repeat until passing

### Step 5: Document Improvements
- Note any tool improvements needed
- See [Feedback Loop](./guides/04-feedback-loop.md)
- Consider updating the tool itself
- Simplify prompt after tool improvements

### Step 6: Verify and Finalize
1. Run test 3 times - must pass consistently
2. Verify all required tools are called
3. Check success pattern appears
4. Review verbose output for inefficiencies
5. Optimize if needed (remove redundant calls, simplify prompt)
6. Disable `verbose` mode
7. **Ensure test is 100% passing and optimized before moving to next test** ⚠️
8. Commit the test

---

## Critical Success Factors

### ✅ DO
- **Always build first**: `npm run build`
- **Use verbose mode**: During development
- **Unique identifiers**: Timestamps for all test data
- **Search for IDs**: Don't hardcode
- **Clear instructions**: Step-by-step, explicit
- **One issue at a time**: Iterative fixes
- **Run 3 times**: Ensure consistency
- **Optimize before moving on**: Review verbose output for inefficiencies
- **Complete one test fully**: Before starting the next test ⚠️
- **Document improvements**: Note tool issues

### ❌ DON'T
- Skip building before running tests
- Assume tool names without checking source
- Use hardcoded emails/usernames
- Write vague prompts
- Fix multiple issues simultaneously
- **Move to next test while current test is broken or inefficient** ⚠️
- Commit without verifying consistency
- Ignore tool improvement opportunities
- Leave redundant tool calls in the workflow

---

## Optimization Checklist

Before moving to the next test, ensure your current test is fully optimized:

### ✅ Test Passes Consistently
- [ ] Passes 3 times in a row without changes
- [ ] All required tools are called
- [ ] Success pattern appears in result
- [ ] No flaky behavior or random failures

### ✅ Workflow is Efficient
Review verbose output and check for:
- [ ] **No redundant tool calls** - LLM shouldn't call the same tool multiple times with same parameters
- [ ] **No unnecessary searches** - If create returns an ID, don't search again
- [ ] **IDs are reused** - Store ID once, use throughout (don't re-fetch)
- [ ] **Minimal API calls** - Achieve goal with fewest possible tool calls

### ✅ Prompt is Clear
- [ ] Instructions are explicit and step-by-step
- [ ] LLM follows instructions correctly (check verbose output)
- [ ] No ambiguity that causes LLM to guess
- [ ] Success pattern is clear and specific

### ✅ Test is Maintainable
- [ ] Tool names verified from source code
- [ ] Unique identifiers used (timestamps)
- [ ] All created entities are cleaned up
- [ ] Test is self-contained (no external dependencies)

### Example: Inefficient vs Optimized

**❌ Inefficient** (spotted in verbose output):
```
[ASSISTANT] Tool call: create-member
[TOOL RESULT] {"message":"Created","id":"abc-123"}

[ASSISTANT] Tool call: find-member  // 🚨 Redundant! Already have ID
[TOOL RESULT] {...}

[ASSISTANT] Tool call: get-member
[TOOL RESULT] {...}

[ASSISTANT] Tool call: get-member  // 🚨 Redundant! Already fetched
[TOOL RESULT] {...}
```
**4 tool calls** - 2 are redundant

**✅ Optimized** (after fixing prompt):
```
[ASSISTANT] Tool call: create-member
[TOOL RESULT] {"message":"Created","id":"abc-123"}

[ASSISTANT] Tool call: get-member  // Uses ID from create
[TOOL RESULT] {...}
```
**2 tool calls** - No redundancy

### How to Optimize

1. **Review verbose output** line by line
2. **Identify patterns**:
   - Same tool called twice?
   - Fetching data already available?
   - Searching when ID is known?
3. **Update prompt** to be more explicit:
   ```typescript
   // Before:
   prompt: `- Create member and get details`

   // After:
   prompt: `
   - Create member (will return ID)
   - Use the ID from create response (don't search again)
   - Get full details using that ID
   `
   ```
4. **Rebuild and run** - verify improvement
5. **Check tool call count** - should be lower

### 🚫 Don't Move Forward Until

- Test passes reliably (3+ times)
- Workflow is efficient (no redundant calls)
- Prompt is clear (LLM follows correctly)
- You've documented any tool improvements needed

**One solid, optimized test is better than multiple broken or inefficient tests!**

---

## Common Issues Quick Reference

| Issue | Solution | Guide |
|-------|----------|-------|
| Tool not found | Check source for correct name | [02. Debugging](./guides/02-debugging-routine.md#1-tool-not-found) |
| "Unknown error" | Check required fields, unique IDs | [02. Debugging](./guides/02-debugging-routine.md#2-unknown-error-or-api-errors) |
| Create returns void | Add search step after create | [03. API Patterns](./guides/03-api-patterns.md#critical-edge-case-create-doesnt-return-usable-id) |
| LLM ignores instructions | Make prompt MORE explicit | [02. Debugging](./guides/02-debugging-routine.md#3-llm-not-following-instructions) |
| Missing required tools | Mention each tool explicitly | [02. Debugging](./guides/02-debugging-routine.md#4-missing-required-tools) |
| Inefficient tool usage | Tell LLM to reuse results | [02. Debugging](./guides/02-debugging-routine.md#5-inefficient-tool-usage) |
| Test timeout | Increase maxTurns or simplify | [02. Debugging](./guides/02-debugging-routine.md#6-test-timeout) |

---

## Next Steps

1. **Read**: [Prompt Patterns guide](./guides/01-prompt-patterns.md)
2. **Study**: [Member management example](./guides/05-examples.md#example-member-management-eval-test)
3. **Create**: Your first eval test
4. **Debug**: Using [Debugging Routine](./guides/02-debugging-routine.md)
5. **Improve**: Tools using [Feedback Loop](./guides/04-feedback-loop.md)

---

## Quick Template

Copy this to start a new eval test:

```typescript
import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "./helpers/index.js";

const ENTITY_TOOLS = [
  // TODO: List your tools here, grouped by category
] as const;

describe("entity name eval tests", () => {
  setupConsoleMock();

  it("should [describe workflow]",
    runScenarioTest({
      prompt: `Complete these tasks in order using a unique identifier:
- Generate unique timestamp identifier
- [Your step-by-step instructions here]
- When all tasks complete, say 'The [entity] workflow has completed successfully'`,
      tools: ENTITY_TOOLS,
      requiredTools: [
        // TODO: List tools that MUST be called
      ],
      successPattern: "[entity] workflow has completed successfully",
      options: { maxTurns: 20 },
      verbose: true,  // Disable after testing
    }),
    180000
  );
});
```

---

## Remember

**Every eval test is an opportunity to make both the test AND the tools better!** 🔄✨

Use verbose mode, discover issues, improve tools, simplify tests. This is continuous improvement in action.
