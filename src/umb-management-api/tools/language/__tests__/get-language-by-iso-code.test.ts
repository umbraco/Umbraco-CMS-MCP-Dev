import { getLanguageByIsoCodeParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import GetLanguageByIsoCodeTool from "../get/get-language-by-iso-code.js";
import { LanguageBuilder } from "./helpers/language-builder.js";
import { LanguageTestHelper } from "./helpers/language-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_LANGUAGE_NAME = "_Test Language";
const TEST_LANGUAGE_ISO = "en-ZW";

describe("get-language-by-iso-code", () => {
  setupTestEnvironment();

  let builder: LanguageBuilder;

  beforeEach(async () => {
    await LanguageTestHelper.cleanup(TEST_LANGUAGE_ISO);
    builder = new LanguageBuilder();
  });

  afterEach(async () => {
    await builder.cleanup();
    await LanguageTestHelper.cleanup(TEST_LANGUAGE_ISO);
  });

  it("should get a language by isoCode", async () => {
    await builder
      .withName(TEST_LANGUAGE_NAME)
      .withIsoCode(TEST_LANGUAGE_ISO)
      .withIsDefault(false)
      .withIsMandatory(false)
      .create();
    const params = getLanguageByIsoCodeParams.parse({ isoCode: builder.getIsoCode() });
    const result = await GetLanguageByIsoCodeTool.handler(
      params,
      createMockRequestHandlerExtra()
    );
    validateToolResponse(GetLanguageByIsoCodeTool, result);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle non-existent language", async () => {
    const params = getLanguageByIsoCodeParams.parse({ isoCode: "does-not-exist" });
    const result = await GetLanguageByIsoCodeTool.handler(
      params,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });
});
