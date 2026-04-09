import GetLanguageTool from "../get/get-language.js";
import { LanguageBuilder } from "./helpers/language-builder.js";
import { LanguageTestHelper } from "./helpers/language-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { withCursorPagination } from "@umbraco-cms/mcp-server-sdk";
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
    const cursorTool = withCursorPagination(GetLanguageTool);
    const result = await cursorTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert - validate response against cursor-wrapped output schema
    const data = validateToolResponse(cursorTool, result);
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
    const cursorTool = withCursorPagination({ ...GetLanguageTool, pageSize: 1 });
    const page1 = await cursorTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert - validate against cursor-wrapped output schema
    const data1 = validateToolResponse(cursorTool, page1) as CursorPaginatedResult;
    expect(data1.items).toHaveLength(1);
    expect(data1.total).toBeGreaterThanOrEqual(4); // default + 3 test languages
    expect(data1.nextCursor).toBeDefined();

    // Act - Get second page using cursor
    const page2 = await cursorTool.handler(
      { cursor: data1.nextCursor },
      createMockRequestHandlerExtra()
    );

    // Assert - validate and check different items
    const data2 = validateToolResponse(cursorTool, page2) as CursorPaginatedResult;
    expect(data2.items).toHaveLength(1);
    expect(data2.total).toBe(data1.total);
    expect((data2.items[0] as any).isoCode).not.toBe((data1.items[0] as any).isoCode);
  });

  it("should not expose skip and take in cursor tool schema", async () => {
    const cursorTool = withCursorPagination(GetLanguageTool);

    expect(cursorTool.inputSchema).toHaveProperty("cursor");
    expect(cursorTool.inputSchema).not.toHaveProperty("skip");
    expect(cursorTool.inputSchema).not.toHaveProperty("take");
  });
});
