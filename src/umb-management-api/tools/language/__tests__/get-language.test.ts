import GetLanguageTool from "../get/get-language.js";
import { LanguageBuilder } from "./helpers/language-builder.js";
import { LanguageTestHelper } from "./helpers/language-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { type CursorPaginatedResult } from "@umbraco-cms/mcp-server-sdk/testing";

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

    // Act - Get all languages (no cursor = first page)
    const result = await GetLanguageTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert - validate response against cursor-wrapped output schema
    const data = validateToolResponse(GetLanguageTool, result);
    expect(data.items.length).toBeGreaterThanOrEqual(3); // default + 2 test languages
    const isoCodes = data.items.map((item: any) => item.isoCode);
    expect(isoCodes).toContain(TEST_LANGUAGE_ISO_1);
    expect(isoCodes).toContain(TEST_LANGUAGE_ISO_2);
  });

  it("should paginate using cursor", async () => {
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

    // Act - Get first page with pageSize=1
    const page1 = await GetLanguageTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert - validate against cursor-wrapped output schema
    const data1 = validateToolResponse(GetLanguageTool, page1);
    expect(data1.items.length).toBeGreaterThanOrEqual(1);
    expect(data1.total).toBeGreaterThanOrEqual(4); // default + 3 test languages
    expect((data1 as any).nextCursor).toBeDefined();

    // Act - Get second page using cursor
    const page2 = await GetLanguageTool.handler(
      { cursor: (data1 as any).nextCursor },
      createMockRequestHandlerExtra()
    );

    // Assert - validate and check different items
    const data2 = validateToolResponse(GetLanguageTool, page2);
    expect(data2.items.length).toBeGreaterThanOrEqual(0);
    expect(data2.total).toBe(data1.total);
    expect((data2.items[0] as any).isoCode).not.toBe((data1.items[0] as any).isoCode);
  });

  it("should not expose skip and take in cursor tool schema", async () => {

    expect(GetLanguageTool.inputSchema).toHaveProperty("cursor");
    expect(GetLanguageTool.inputSchema).not.toHaveProperty("skip");
    expect(GetLanguageTool.inputSchema).not.toHaveProperty("take");
  });
});
