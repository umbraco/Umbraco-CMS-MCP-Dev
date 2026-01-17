import DeleteLanguageTool from "../delete/delete-language.js";
import { LanguageBuilder } from "./helpers/language-builder.js";
import { LanguageTestHelper } from "./helpers/language-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("delete-language", () => {
  setupTestEnvironment();

  const TEST_LANGUAGE_NAME = "_Test Language Delete";
  const TEST_LANGUAGE_ISO = "en-GB";
  let builder: LanguageBuilder;

  beforeEach(() => {
    builder = new LanguageBuilder();
  });

  afterEach(async () => {
    await builder.cleanup();
    await LanguageTestHelper.cleanup(TEST_LANGUAGE_ISO);
  });

  it("should delete a language", async () => {
    // Create a language to delete
    await builder
      .withName(TEST_LANGUAGE_NAME)
      .withIsoCode(TEST_LANGUAGE_ISO)
      .withIsDefault(false)
      .withIsMandatory(false)
      .create();

    // Delete the language
    const result = await DeleteLanguageTool.handler(
      { isoCode: builder.getIsoCode() },
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();

    // Verify the language no longer exists
    const exists = await LanguageTestHelper.verifyLanguage(TEST_LANGUAGE_ISO);
    expect(exists).toBe(false);
  });

  it("should handle non-existent language", async () => {
    const nonExistentIso = "xx-DEL";
    const result = await DeleteLanguageTool.handler(
      { isoCode: nonExistentIso },
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});
