---
root: false
targets:
  - '*'
description: Should be referenced when working with testing
globs: []
cursorRuleType: intelligently
---

# Model Context Providers Testing Guide
You are an expert in TypeScript and Jest and testing Model Context Protocol implementations.

## Core Concepts and Architecture

- all tests and feature sliced, they go in the __tests__ folder in the root of each feature
- use builder pattern to create helpers where model entities are worked with out side of what is being tested
- create test helpers for common used functionality within testing
    - create global test helpers that can used trought out the system
    - create local test helpers for features slices or single entities
    - create tests for test helpers so we are sure they work
- create a single test file per area of testing per feature e.g create, delete, find, get and move. The only exception to this is with trees, where ancestor, tree and root can be grouped together. This is because they are just tree manipulation of hierarchical content
- testing should be minimal per feature, we just want to smoke test the api calls to Umbraco. Not test Umbraco
- all strings used in builders should be a constant at the head of the test
- all created object should be deleted / cleaned up in the after test hook

## Inside test rules

- always use arrange, act and assert
- instead of asserting on individual properties, snapshots should be used to assert content of json objects
- turn off console.error for testing
- create local constants for any entity names, don't use magic strings
- don't rely on existing content, always create new content and delete when finished
- test the tool handlers not MCP itself
- any api params should use the zod schema to parse objects
- for the act phase of testing always use the call to the tool handle. For the arrange always use the helper or the builder.
- any password field will need to be at least 10 characters and contain at least one number and one symbol.

## Snapshot Testing and Data Normalization

- **Always use `createSnapshotResult()` helper** from `@/test-helpers/create-snapshot-result.js` for normalizing API responses before snapshot testing
- **Never manually manipulate IDs or dates** in test code - let the helper handle normalization
- **Use `createSnapshotResult(result)` for list/tree responses** - it automatically normalizes all items in arrays
- **Use `createSnapshotResult(result, specificId)` for single item responses** - when you need to normalize a specific ID

### Example of correct snapshot testing:
```typescript
// ✅ Correct - let the helper normalize everything
const result = await GetTemplateSearchTool().handler(params, { signal: new AbortController().signal });
const normalizedItems = createSnapshotResult(result);
expect(normalizedItems).toMatchSnapshot();

// ❌ Wrong - manual ID manipulation
const items = JSON.parse(result.content[0].text);
items.items = items.items.map(item => ({ ...item, id: "normalized" }));
expect(result).toMatchSnapshot();
```

The `createSnapshotResult` helper automatically:
- Converts all `id` fields to `BLANK_UUID` 
- Normalizes `createDate`, `updateDate`, `publishDate` to `"NORMALIZED_DATE"`
- Handles nested objects like `parent` references
- Works with both single items and arrays of items

The Dictionary entity is the gold standard for testing. Use this as a reference for creating new feature testing suites. This is both in terms of the splitting between logical api endpoints and the number of tests created.

Here is an example of a test as reference

```
import CreateDictionaryItemTool from "../post/create-dictionary-item.js";
import { DEFAULT_ISO_CODE, DictionaryVerificationHelper } from "./helpers/dictionary-verification-helper.js";
import { jest } from "@jest/globals";

const TEST_DICTIONARY_NAME = "_Test Dictionary Created";
const TEST_DICTIONARY_TRANSLATION = "_Test Translation";
const EXISTING_DICTIONARY_NAME = "_Existing Dictionary";
const EXISTING_DICTIONARY_TRANSLATION = "_Existing Translation";

describe("create-dictionary-item", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    // Clean up any test dictionary items
    await DictionaryVerificationHelper.cleanup(TEST_DICTIONARY_NAME);
    await DictionaryVerificationHelper.cleanup(EXISTING_DICTIONARY_NAME);
  });

  it("should create a dictionary item", async () => {
    const result = await CreateDictionaryItemTool().handler({
      name: TEST_DICTIONARY_NAME,
      translations: [{ isoCode: DEFAULT_ISO_CODE, translation: TEST_DICTIONARY_TRANSLATION }]
    }, { signal: new AbortController().signal });

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();

    // Verify the created item exists and matches expected values
    const items = await DictionaryVerificationHelper.findDictionaryItems(TEST_DICTIONARY_NAME, true);
    expect(items).toMatchSnapshot();
  });

  it("should handle existing dictionary item", async () => {
    // First create the item
    await CreateDictionaryItemTool().handler({
      name: EXISTING_DICTIONARY_NAME,
      translations: [{ isoCode: DEFAULT_ISO_CODE, translation: EXISTING_DICTIONARY_TRANSLATION }]
    }, { signal: new AbortController().signal });

    // Try to create it again
    const result = await CreateDictionaryItemTool().handler({
      name: EXISTING_DICTIONARY_NAME,
      translations: [{ isoCode: DEFAULT_ISO_CODE, translation: EXISTING_DICTIONARY_TRANSLATION }]
    }, { signal: new AbortController().signal });

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
}); 
```

## Process for generating tests for a feature

Always follow this process when asked to create testing for a new feature. Complete these one at a time, always stop between each step.

- always build the builder first for the entities present in the feature. There may be more than one, e.g Document Blueprints have Document Blueprint and Document BluePrint folders
- before actual testing create a helper alongside the builder that will allow easy arrangement. This likely includes methods to 
    - normalise ids : convert all generated ids to the blank for snapshotting
    - cleanup : remove any added items for tests
    - find : find an items from the search / items, dependant on the feature. be careful
- next start by creating one test for creating a entity then stop and test that
- then create the CRUD operations
- then add items tests (ancestor, chidren, root)
- then add folder tests

## Builders

Test builders help us to create a narrative around the arrange partt of the test. They help us to build up and create instance of the entity. 

- should include the model that is typed the to the create requests RequuestModel i.e CreateDictionaryItemRequestModel for postDictionary
- should include with methods that add new data to the model. They always return this.
```
  withName(name: string): DictionaryBuilder {
    this.model.name = name;
    return this;
  }
```
- should include a build method that returns the model
- should include a create method that is async and returns a Promise<Builder>
    - the create should use zod to verify the model
    - the create should create a new entity and set a local createdItem property with the newly create entity
    - the create should check that the model has been created by either
        - getting the model directly from the API. only possible if the API includes a endpoint that get by name
        - if this is not the case then use the find static method on the helper to get the entity
- should include a getId method that return the created item id
- should include a getItem method that returns the created item,

The builder shouls always have integration tests that test that the builder works and integrates correctly