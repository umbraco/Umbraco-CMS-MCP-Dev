import CreateDictionaryItemTool from "../post/create-dictionary-item.js";
import { DEFAULT_ISO_CODE, DictionaryTestHelper } from "./helpers/dictionary-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  normalizeErrorResponse,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DICTIONARY_NAME = "_Test Dictionary Created";
const TEST_DICTIONARY_TRANSLATION = "_Test Translation";
const EXISTING_DICTIONARY_NAME = "_Existing Dictionary";
const EXISTING_DICTIONARY_TRANSLATION = "_Existing Translation";

describe("create-dictionary-item", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test dictionary items
    await DictionaryTestHelper.cleanup(TEST_DICTIONARY_NAME);
    await DictionaryTestHelper.cleanup(EXISTING_DICTIONARY_NAME);
    await DictionaryTestHelper.cleanup("_Test Parent Dictionary");
    await DictionaryTestHelper.cleanup("_Test Child Dictionary");
    await DictionaryTestHelper.cleanup("_Parent Dictionary");
  });

  it("should create a dictionary item", async () => {
    const result = await CreateDictionaryItemTool.handler({
      name: TEST_DICTIONARY_NAME,
      translations: [{ isoCode: DEFAULT_ISO_CODE, translation: TEST_DICTIONARY_TRANSLATION }]
    } as any, createMockRequestHandlerExtra());

    // Validate structured response
    const responseData = validateToolResponse(CreateDictionaryItemTool, result);
    expect(responseData.message).toBe("Dictionary item created successfully");

    // Verify the handler response using snapshot
    expect(createSnapshotResult(result, responseData.id)).toMatchSnapshot();

    // Verify the created item exists and matches expected values
    const items = await DictionaryTestHelper.findDictionaryItems(TEST_DICTIONARY_NAME, true);
    expect(items).toMatchSnapshot();
  });

  it("should handle existing dictionary item", async () => {
    // First create the item
    await CreateDictionaryItemTool.handler({
      name: EXISTING_DICTIONARY_NAME,
      translations: [{ isoCode: DEFAULT_ISO_CODE, translation: EXISTING_DICTIONARY_TRANSLATION }]
    } as any, createMockRequestHandlerExtra());

    // Try to create it again
    const result = await CreateDictionaryItemTool.handler({
      name: EXISTING_DICTIONARY_NAME,
      translations: [{ isoCode: DEFAULT_ISO_CODE, translation: EXISTING_DICTIONARY_TRANSLATION }]
    } as any, createMockRequestHandlerExtra());

    // Verify the error response using snapshot
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });

  it("should create a dictionary item with parent", async () => {
    // Import builder at the top level instead
    const { DictionaryBuilder } = await import("./helpers/dictionary-builder.js");

    // Create parent dictionary
    const parentBuilder = await new DictionaryBuilder()
      .withName("_Test Parent Dictionary")
      .withTranslation(DEFAULT_ISO_CODE, "_Parent Translation")
      .create();

    // Create child dictionary with parentId (flattened parameter)
    const result = await CreateDictionaryItemTool.handler({
      name: "_Test Child Dictionary",
      parentId: parentBuilder.getId(),
      translations: [{ isoCode: DEFAULT_ISO_CODE, translation: "_Child Translation" }]
    } as any, createMockRequestHandlerExtra());

    // Validate structured response
    const responseData = validateToolResponse(CreateDictionaryItemTool, result);

    // Verify the handler response using snapshot (normalize IDs)
    expect(createSnapshotResult(result, responseData.id)).toMatchSnapshot();

    // Verify the created item exists and has correct parent (normalize IDs)
    const items = await DictionaryTestHelper.findDictionaryItems("_Test Child Dictionary", true);
    expect(createSnapshotResult(items)).toMatchSnapshot();

    // Cleanup
    await DictionaryTestHelper.cleanup("_Test Child Dictionary");
    await DictionaryTestHelper.cleanup("_Test Parent Dictionary");
  });
});
