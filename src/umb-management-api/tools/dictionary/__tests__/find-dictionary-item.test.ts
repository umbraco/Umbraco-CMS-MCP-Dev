import FindDictionaryItemTool from "../get/find-dictionary-item.js";
import { DictionaryBuilder } from "./helpers/dictionary-builder.js";
import { DEFAULT_ISO_CODE } from "./helpers/dictionary-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DICTIONARY_NAME = "_Test Dictionary Find";
const TEST_DICTIONARY_TRANSLATION = "_Test Translation Find";

describe("find-dictionary-item", () => {
  setupTestEnvironment();
  let helper: DictionaryBuilder;

  beforeEach(() => {
    helper = new DictionaryBuilder();
  });

  afterEach(async () => {
    await helper.cleanup();
  });

  it("should find a dictionary item by name", async () => {
    // Create a dictionary item first
    await helper
      .withName(TEST_DICTIONARY_NAME)
      .withTranslation(DEFAULT_ISO_CODE, TEST_DICTIONARY_TRANSLATION)
      .create();

    const result = await FindDictionaryItemTool.handler(
      {
        filter: TEST_DICTIONARY_NAME,
        take: 100,
      } as any,
      createMockRequestHandlerExtra()
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle non-existent dictionary item", async () => {
    const result = await FindDictionaryItemTool.handler(
      {
        filter: "Non Existent Dictionary",
        take: 100,
      } as any,
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });
});
