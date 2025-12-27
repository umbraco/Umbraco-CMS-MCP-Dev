import { getLanguageByIsoCodeParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import GetLanguageByIsoCodeTool from "../get/get-language-by-iso-code.js";
import { LanguageBuilder } from "./helpers/language-builder.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_LANGUAGE_NAME = "_Test Language";
const TEST_LANGUAGE_ISO = "en-Gb";

describe("get-language-by-iso-code", () => {
  setupTestEnvironment();

  let builder: LanguageBuilder;

  beforeEach(() => {
    builder = new LanguageBuilder();
  });

  afterEach(async () => {
    await builder.cleanup();
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
