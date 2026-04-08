import GetLanguageTool from "../get/get-language.js";
import { LanguageBuilder } from "./helpers/language-builder.js";
import { LanguageTestHelper } from "./helpers/language-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { withCursorPagination } from "@umbraco-cms/mcp-server-sdk";

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

    // Assert - don't snapshot full list as other parallel tests may add languages
    const sc = result.structuredContent as any;
    expect(sc.items.length).toBeGreaterThanOrEqual(3); // default + 2 test languages
    const isoCodes = sc.items.map((item: any) => item.isoCode);
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

    // Assert - first page should return 1 item with nextCursor
    const sc1 = page1.structuredContent as any;
    expect(sc1.items).toHaveLength(1);
    expect(sc1.total).toBeGreaterThanOrEqual(4); // default + 3 test languages
    expect(sc1.nextCursor).toBeDefined();

    // Act - Get second page using cursor
    const page2 = await cursorTool.handler(
      { cursor: sc1.nextCursor },
      createMockRequestHandlerExtra()
    );

    // Assert - second page should have different items
    const sc2 = page2.structuredContent as any;
    expect(sc2.items).toHaveLength(1);
    expect(sc2.total).toBe(sc1.total);
    expect(sc2.items[0].isoCode).not.toBe(sc1.items[0].isoCode);
  });

  it("should not expose skip and take in cursor tool schema", async () => {
    const cursorTool = withCursorPagination(GetLanguageTool);

    expect(cursorTool.inputSchema).toHaveProperty("cursor");
    expect(cursorTool.inputSchema).not.toHaveProperty("skip");
    expect(cursorTool.inputSchema).not.toHaveProperty("take");
  });
});
