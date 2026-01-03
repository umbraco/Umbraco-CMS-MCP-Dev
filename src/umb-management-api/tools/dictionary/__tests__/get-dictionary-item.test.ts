import { getDictionaryByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import GetDictionaryItemTool from "../get/get-dictionary-item.js";
import { DictionaryBuilder } from "./helpers/dictionary-builder.js";
import { DEFAULT_ISO_CODE } from "./helpers/dictionary-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_DICTIONARY_NAME = "_Test Dictionary Get";
const TEST_DICTIONARY_TRANSLATION = "_Test Translation Get";

describe("get-dictionary-item", () => {
  setupTestEnvironment();
  let helper: DictionaryBuilder;

  beforeEach(() => {
    helper = new DictionaryBuilder();
  });

  afterEach(async () => {
    await helper.cleanup();
  });

  it("should get a dictionary item by id", async () => {
    // Create a dictionary item first
    await helper
      .withName(TEST_DICTIONARY_NAME)
      .withTranslation(DEFAULT_ISO_CODE, TEST_DICTIONARY_TRANSLATION)
      .create();

    const params = getDictionaryByIdParams.parse({ id: helper.getId() });

    const result = await GetDictionaryItemTool.handler(
      params as any,
      createMockRequestHandlerExtra()
    );

    expect(createSnapshotResult(result, helper.getId())).toMatchSnapshot();
  });

  it("should handle non-existent dictionary item", async () => {
    const nonExistentId = BLANK_UUID;
    const params = getDictionaryByIdParams.parse({ id: nonExistentId });

    const result = await GetDictionaryItemTool.handler(
      params as any,
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
