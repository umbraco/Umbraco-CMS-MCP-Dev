import GetLanguageTool from "../get/get-language.js";
import { LanguageBuilder } from "./helpers/language-builder.js";
import { LanguageTestHelper } from "./helpers/language-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_LANGUAGE_NAME_1 = "_Test Language Get 1";
const TEST_LANGUAGE_ISO_1 = "en-AU";
const TEST_LANGUAGE_NAME_2 = "_Test Language Get 2";
const TEST_LANGUAGE_ISO_2 = "en-NZ";
const TEST_LANGUAGE_NAME_3 = "_Test Language Get 3";
const TEST_LANGUAGE_ISO_3 = "en-ZA";

describe("get-language", () => {
  setupTestEnvironment();

  let builder1: LanguageBuilder;
  let builder2: LanguageBuilder;
  let builder3: LanguageBuilder;

  beforeEach(async () => {
    await LanguageTestHelper.cleanup(TEST_LANGUAGE_ISO_1);
    await LanguageTestHelper.cleanup(TEST_LANGUAGE_ISO_2);
    await LanguageTestHelper.cleanup(TEST_LANGUAGE_ISO_3);
    builder1 = new LanguageBuilder();
    builder2 = new LanguageBuilder();
    builder3 = new LanguageBuilder();
  });

  afterEach(async () => {
    await builder1.cleanup();
    await builder2.cleanup();
    await builder3.cleanup();
    await LanguageTestHelper.cleanup(TEST_LANGUAGE_ISO_1);
    await LanguageTestHelper.cleanup(TEST_LANGUAGE_ISO_2);
    await LanguageTestHelper.cleanup(TEST_LANGUAGE_ISO_3);
  });

  it("should get all languages", async () => {
    // Arrange - Create test languages
    await builder1
      .withName(TEST_LANGUAGE_NAME_1)
      .withIsoCode(TEST_LANGUAGE_ISO_1)
      .withIsDefault(false)
      .withIsMandatory(false)
      .create();

    await builder2
      .withName(TEST_LANGUAGE_NAME_2)
      .withIsoCode(TEST_LANGUAGE_ISO_2)
      .withIsDefault(false)
      .withIsMandatory(false)
      .create();

    // Act - Get all languages
    const result = await GetLanguageTool.handler(
      { skip: 0, take: 100 },
      createMockRequestHandlerExtra()
    );

    // Assert - don't snapshot full list as other parallel tests may add languages
    const data = validateToolResponse(GetLanguageTool, result);
    expect(data.items.length).toBeGreaterThanOrEqual(3); // default + 2 test languages
    const isoCodes = data.items.map((item: any) => item.isoCode);
    expect(isoCodes).toContain(TEST_LANGUAGE_ISO_1);
    expect(isoCodes).toContain(TEST_LANGUAGE_ISO_2);
  });

  it("should get languages with pagination - skip and take", async () => {
    // Arrange - Create test languages
    await builder1
      .withName(TEST_LANGUAGE_NAME_1)
      .withIsoCode(TEST_LANGUAGE_ISO_1)
      .withIsDefault(false)
      .withIsMandatory(false)
      .create();

    await builder2
      .withName(TEST_LANGUAGE_NAME_2)
      .withIsoCode(TEST_LANGUAGE_ISO_2)
      .withIsDefault(false)
      .withIsMandatory(false)
      .create();

    await builder3
      .withName(TEST_LANGUAGE_NAME_3)
      .withIsoCode(TEST_LANGUAGE_ISO_3)
      .withIsDefault(false)
      .withIsMandatory(false)
      .create();

    // Act - Get languages with skip=1 and take=1
    const result = await GetLanguageTool.handler(
      { skip: 1, take: 1 },
      createMockRequestHandlerExtra()
    );

    // Assert - pagination should return exactly 1 item
    const data = validateToolResponse(GetLanguageTool, result);
    expect(data.items).toHaveLength(1);
    expect(data.total).toBeGreaterThanOrEqual(4); // default + 3 test languages
  });

  it("should get languages with take parameter only", async () => {
    // Arrange - Create test languages
    await builder1
      .withName(TEST_LANGUAGE_NAME_1)
      .withIsoCode(TEST_LANGUAGE_ISO_1)
      .withIsDefault(false)
      .withIsMandatory(false)
      .create();

    await builder2
      .withName(TEST_LANGUAGE_NAME_2)
      .withIsoCode(TEST_LANGUAGE_ISO_2)
      .withIsDefault(false)
      .withIsMandatory(false)
      .create();

    // Act - Get languages with take=1
    const result = await GetLanguageTool.handler(
      { skip: 0, take: 1 },
      createMockRequestHandlerExtra()
    );

    // Assert - take=1 should return exactly 1 item
    const data = validateToolResponse(GetLanguageTool, result);
    expect(data.items).toHaveLength(1);
    expect(data.total).toBeGreaterThanOrEqual(3); // default + 2 test languages
  });
});
