import GetLanguageItemsTool from "../get/get-language-items.js";
import { LanguageBuilder } from "./helpers/language-builder.js";
import { LanguageTestHelper } from "./helpers/language-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-language-items", () => {
  setupTestEnvironment();

  const TEST_LANGUAGE_NAME = "_Test Language Items";
  const TEST_LANGUAGE_ISO = "en-GB";
  let builder: LanguageBuilder;

  beforeEach(() => {
    builder = new LanguageBuilder();
  });

  afterEach(async () => {
    await builder.cleanup();
    await LanguageTestHelper.cleanup(TEST_LANGUAGE_ISO);
  });

  it("should get language item by isoCode", async () => {
    // Ensure the test language exists
    await builder
      .withName(TEST_LANGUAGE_NAME)
      .withIsoCode(TEST_LANGUAGE_ISO)
      .withIsDefault(false)
      .withIsMandatory(false)
      .create();

    const result = await GetLanguageItemsTool.handler(
      { isoCode: [TEST_LANGUAGE_ISO] },
      createMockRequestHandlerExtra()
    );
    validateToolResponse(GetLanguageItemsTool, result);
    expect(result).toMatchSnapshot();
  });

  it("should handle non-existent isoCode", async () => {
    const result = await GetLanguageItemsTool.handler(
      { isoCode: ["xx-NOTFOUND"] },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });
});
