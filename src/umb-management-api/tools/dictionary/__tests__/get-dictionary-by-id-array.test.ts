import GetDictionaryByIdArrayTool from "../get/get-dictionary-by-id-array.js";
import { DictionaryBuilder } from "./helpers/dictionary-builder.js";
import {
  DictionaryTestHelper,
  DEFAULT_ISO_CODE,
} from "./helpers/dictionary-helper.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

describe("get-item-dictionary", () => {
  const TEST_DICTIONARY_NAME = "_Test Item Dictionary";
  const TEST_DICTIONARY_NAME_2 = "_Test Item Dictionary2";
  setupTestEnvironment();

  afterEach(async () => {
    await DictionaryTestHelper.cleanup(TEST_DICTIONARY_NAME);
    await DictionaryTestHelper.cleanup(TEST_DICTIONARY_NAME_2);
  });

  it("should get no dictionary items for empty request", async () => {
    // Get all dictionary items
    const result = await GetDictionaryByIdArrayTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );
    // Access structured content
    const items = (result.structuredContent as any).items;
    expect(items).toMatchSnapshot();
  });

  it("should get single dictionary item by ID", async () => {
    // Create a dictionary item
    const builder = await new DictionaryBuilder()
      .withName(TEST_DICTIONARY_NAME)
      .withTranslation(DEFAULT_ISO_CODE, "Test Value")
      .create();

    // Get by ID
    const result = await GetDictionaryByIdArrayTool.handler(
      { id: [builder.getId()] } as any,
      createMockRequestHandlerExtra()
    );

    // Access structured content
    const items = (result.structuredContent as any).items;
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe(TEST_DICTIONARY_NAME);

    // Normalize for snapshot using helper
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should get multiple dictionary items by ID", async () => {
    // Create first dictionary item
    const builder1 = await new DictionaryBuilder()
      .withName(TEST_DICTIONARY_NAME)
      .withTranslation(DEFAULT_ISO_CODE, "Test Value 1")
      .create();

    // Create second dictionary item
    const builder2 = await new DictionaryBuilder()
      .withName(TEST_DICTIONARY_NAME_2)
      .withTranslation(DEFAULT_ISO_CODE, "Test Value 2")
      .create();

    // Get by IDs
    const result = await GetDictionaryByIdArrayTool.handler(
      {
        id: [builder1.getId(), builder2.getId()],
      } as any,
      createMockRequestHandlerExtra()
    );

    // Access structured content
    const items = (result.structuredContent as any).items;
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe(TEST_DICTIONARY_NAME);
    expect(items[1].name).toBe(TEST_DICTIONARY_NAME_2);

    // Normalize for snapshot using helper
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
