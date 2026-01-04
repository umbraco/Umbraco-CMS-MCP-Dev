import MoveDictionaryItemTool from "../put/move-dictionary-item.js";
import { DictionaryBuilder } from "./helpers/dictionary-builder.js";
import { DEFAULT_ISO_CODE } from "./helpers/dictionary-helper.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { BLANK_UUID } from "@/constants/constants.js";

const CHILD_DICTIONARY_NAME = "_Child Dictionary";
const CHILD_DICTIONARY_TRANSLATION = "_Child Translation";
const PARENT_DICTIONARY_NAME = "_Parent Dictionary";
const PARENT_DICTIONARY_TRANSLATION = "_Parent Translation";

describe("move-dictionary-item", () => {
  setupTestEnvironment();
  let childHelper: DictionaryBuilder;
  let parentHelper: DictionaryBuilder;

  beforeEach(() => {
    childHelper = new DictionaryBuilder();
    parentHelper = new DictionaryBuilder();
  });

  afterEach(async () => {
    await childHelper.cleanup();
    await parentHelper.cleanup();
  });

  it("should move a dictionary item to a new parent", async () => {
    // Create parent dictionary item
    await parentHelper
      .withName(PARENT_DICTIONARY_NAME)
      .withTranslation(DEFAULT_ISO_CODE, PARENT_DICTIONARY_TRANSLATION)
      .create();

    // Create child dictionary item
    await childHelper
      .withName(CHILD_DICTIONARY_NAME)
      .withTranslation(DEFAULT_ISO_CODE, CHILD_DICTIONARY_TRANSLATION)
      .create();

    const result = await MoveDictionaryItemTool.handler(
      {
        id: childHelper.getId(),
        data: {
          target: {
            id: parentHelper.getId(),
          },
        },
      } as any,
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
  });

  it("should move a dictionary item from parent back to root", async () => {
    // Create parent dictionary item
    await parentHelper
      .withName(PARENT_DICTIONARY_NAME)
      .withTranslation(DEFAULT_ISO_CODE, PARENT_DICTIONARY_TRANSLATION)
      .create();

    // Create child dictionary item under parent
    await childHelper
      .withName(CHILD_DICTIONARY_NAME)
      .withTranslation(DEFAULT_ISO_CODE, CHILD_DICTIONARY_TRANSLATION)
      .withParentId(parentHelper.getId())
      .create();

    const result = await MoveDictionaryItemTool.handler(
      {
        id: childHelper.getId(),
        data: {
          target: null,
        },
      } as any,
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
  });

  it("should handle non-existent dictionary item", async () => {
    const result = await MoveDictionaryItemTool.handler(
      {
        id: BLANK_UUID,
        data: {
          target: null,
        },
      } as any,
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
