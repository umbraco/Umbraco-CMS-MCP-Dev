import GetLanguageTool from "../get/get-language.js";
import { LanguageBuilder } from "./helpers/language-builder.js";
import { LanguageTestHelper } from "./helpers/language-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_LANGUAGE_NAME_1 = "_Test Language Get 1";
const TEST_LANGUAGE_ISO_1 = "en-AU";
const TEST_LANGUAGE_NAME_2 = "_Test Language Get 2";
const TEST_LANGUAGE_ISO_2 = "en-NZ";
const TEST_LANGUAGE_NAME_3 = "_Test Language Get 3";
const TEST_LANGUAGE_ISO_3 = "en-ZA";

describe("get-language", () => {
  let originalConsoleError: typeof console.error;
  let builder1: LanguageBuilder;
  let builder2: LanguageBuilder;
  let builder3: LanguageBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
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
    console.error = originalConsoleError;
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

    // Act - Get all languages (take parameter has default, so empty object is valid)
    const result = await GetLanguageTool().handler({ take: 100 }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
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
    const result = await GetLanguageTool().handler(
      { skip: 1, take: 1 },
      { signal: new AbortController().signal }
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
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
    const result = await GetLanguageTool().handler(
      { take: 1 },
      { signal: new AbortController().signal }
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
