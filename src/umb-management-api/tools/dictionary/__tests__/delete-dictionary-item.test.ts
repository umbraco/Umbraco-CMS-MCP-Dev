import DeleteDictionaryItemTool from "../delete/delete-dictionary-item.js";
import { DictionaryBuilder } from "./helpers/dictionary-builder.js";
import {
  DEFAULT_ISO_CODE,
  DictionaryTestHelper,
} from "./helpers/dictionary-helper.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_DICTIONARY_NAME = "_Test Dictionary Delete";
const TEST_DICTIONARY_TRANSLATION = "_Test Translation Delete";

describe("delete-dictionary-item", () => {
  setupTestEnvironment();
  let builder: DictionaryBuilder;

  beforeEach(() => {
    builder = new DictionaryBuilder();
  });

  it("should delete a dictionary item", async () => {
    // Create initial dictionary item
    await builder
      .withName(TEST_DICTIONARY_NAME)
      .withTranslation(DEFAULT_ISO_CODE, TEST_DICTIONARY_TRANSLATION)
      .create();

    const result = await DeleteDictionaryItemTool.handler(
      {
        id: builder.getId(),
      } as any,
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();

    // Verify the item no longer exists
    const items = await DictionaryTestHelper.findDictionaryItems(
      TEST_DICTIONARY_NAME
    );
    expect(items).toHaveLength(0);
  });

  it("should handle non-existent dictionary item", async () => {
    const result = await DeleteDictionaryItemTool.handler(
      {
        id: BLANK_UUID,
      } as any,
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
