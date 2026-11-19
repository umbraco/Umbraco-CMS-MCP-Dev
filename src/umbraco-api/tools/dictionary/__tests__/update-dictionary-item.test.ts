import UpdateDictionaryItemTool from "../put/update-dictionary-item.js";
import { DictionaryBuilder } from "./helpers/dictionary-builder.js";
import {
  DEFAULT_ISO_CODE,
  DictionaryTestHelper,
} from "./helpers/dictionary-helper.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  getResultText,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DICTIONARY_NAME = "_Test Dictionary Update";
const TEST_DICTIONARY_TRANSLATION = "_Test Translation Update";
const UPDATED_DICTIONARY_NAME = "_Updated Dictionary";
const UPDATED_DICTIONARY_TRANSLATION = "_Updated Translation";
const NON_EXISTENT_DICTIONARY_NAME = "_Non Existent Dictionary";
const NON_EXISTENT_DICTIONARY_TRANSLATION = "_Non Existent Translation";

describe("update-dictionary-item", () => {
  setupTestEnvironment();
  let helper: DictionaryBuilder;

  beforeEach(() => {
    helper = new DictionaryBuilder();
  });

  afterEach(async () => {
    await helper.cleanup();
  });

  it("should update a dictionary item", async () => {
    // Create initial dictionary item
    await helper
      .withName(TEST_DICTIONARY_NAME)
      .withTranslation(DEFAULT_ISO_CODE, TEST_DICTIONARY_TRANSLATION)
      .create();

    const result = await UpdateDictionaryItemTool.handler(
      {
        id: helper.getId(),
        data: {
          name: UPDATED_DICTIONARY_NAME,
          translations: [
            {
              isoCode: DEFAULT_ISO_CODE,
              translation: UPDATED_DICTIONARY_TRANSLATION,
            },
          ],
        },
      } as any,
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();

    // Verify the updated item exists and matches expected values
    const items = await DictionaryTestHelper.findDictionaryItems(
      UPDATED_DICTIONARY_NAME,
      true
    );
    expect(items).toMatchSnapshot();
  });

  // Regression for #604: free-text body fields must accept '?' and '&'
  it("should accept '?' and '&' in the name and translations", async () => {
    await helper
      .withName(TEST_DICTIONARY_NAME)
      .withTranslation(DEFAULT_ISO_CODE, TEST_DICTIONARY_TRANSLATION)
      .create();

    const name = "_Test Dictionary Q&A?";
    const translation = "Wat zoek je? Joost & Co";

    const result = await UpdateDictionaryItemTool.handler(
      {
        id: helper.getId(),
        data: {
          name,
          translations: [{ isoCode: DEFAULT_ISO_CODE, translation }],
        },
      } as any,
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBeFalsy();

    const item = await DictionaryTestHelper.getDictionaryItem(helper.getId());
    expect(item.name).toBe(name);
    expect(
      item.translations.find((t) => t.isoCode === DEFAULT_ISO_CODE)?.translation
    ).toBe(translation);
  });

  it("should still reject control characters in translations", async () => {
    await helper
      .withName(TEST_DICTIONARY_NAME)
      .withTranslation(DEFAULT_ISO_CODE, TEST_DICTIONARY_TRANSLATION)
      .create();

    const result = await UpdateDictionaryItemTool.handler(
      {
        id: helper.getId(),
        data: {
          name: TEST_DICTIONARY_NAME,
          translations: [
            { isoCode: DEFAULT_ISO_CODE, translation: "Bad\u0007value" },
          ],
        },
      } as any,
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
    expect(getResultText(result)).toContain("control characters");

    // The stored translation must be unchanged
    const item = await DictionaryTestHelper.getDictionaryItem(helper.getId());
    expect(
      item.translations.find((t) => t.isoCode === DEFAULT_ISO_CODE)?.translation
    ).toBe(TEST_DICTIONARY_TRANSLATION);
  });

  it("should handle non-existent dictionary item", async () => {
    const result = await UpdateDictionaryItemTool.handler(
      {
        id: BLANK_UUID,
        data: {
          name: NON_EXISTENT_DICTIONARY_NAME,
          translations: [
            {
              isoCode: DEFAULT_ISO_CODE,
              translation: NON_EXISTENT_DICTIONARY_TRANSLATION,
            },
          ],
        },
      } as any,
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
