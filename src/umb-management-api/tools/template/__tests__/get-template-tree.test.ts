import { TemplateTestHelper } from "./helpers/template-helper.js";
import GetTemplateAncestorsTool from "../items/get/get-ancestors.js";
import GetTemplateChildrenTool from "../items/get/get-children.js";
import GetTemplateRootTool from "../items/get/get-root.js";
import GetTemplateSearchTool from "../items/get/get-search.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { TemplateBuilder } from "./helpers/template-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";

describe("template-tree", () => {
  const TEST_ROOT_NAME = "_Test Root Template";
  const TEST_CHILD_NAME = "_Test Child Template";
  const TEST_PARENT_NAME = "_Test Parent Template";
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await TemplateTestHelper.cleanup(TEST_ROOT_NAME);
    await TemplateTestHelper.cleanup(TEST_CHILD_NAME);
    await TemplateTestHelper.cleanup(TEST_PARENT_NAME);
  });

  //can't test root as it will change throughout testing

  describe("children", () => {
    it("should get child items", async () => {
      // Create parent template
      const parentBuilder = await new TemplateBuilder()
        .withName(TEST_PARENT_NAME)
        .create();

      // Create child template
      const builder = new TemplateBuilder();
      await builder
        .withName(TEST_CHILD_NAME)
        .withContent("<h1>@Model.Title</h1>")
        .withParent(parentBuilder.getId())
        .create();

      const result = await GetTemplateChildrenTool().handler(
        {
          take: 100,
          parentId: parentBuilder.getId(),
        },
        { signal: new AbortController().signal }
      );

      // Normalize and verify response
      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();
    });

    it("should handle non-existent parent", async () => {
      const result = await GetTemplateChildrenTool().handler(
        {
          take: 100,
          parentId: BLANK_UUID,
        },
        { signal: new AbortController().signal }
      );

      expect(result).toMatchSnapshot();
    });
  });

  describe("ancestors", () => {
    it("should get ancestor items", async () => {
      // Create parent template
      const parentBuilder = await new TemplateBuilder()
        .withName("_Test Parent Template")
        .create();

      // Create child template
      const builder = new TemplateBuilder();
      const childBuilder = await builder
        .withName(TEST_CHILD_NAME)
        .withContent("<h1>@Model.Title</h1>")
        .withParent(parentBuilder.getId())
        .create();

      const result = await GetTemplateAncestorsTool().handler(
        {
          descendantId: childBuilder.getId(),
        },
        { signal: new AbortController().signal }
      );

      // Normalize and verify response
      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();

      // Cleanup child template
      await childBuilder.cleanup();
      // Cleanup parent template
      await parentBuilder.cleanup();
    });

    it("should handle non-existent item", async () => {
      const result = await GetTemplateAncestorsTool().handler(
        {
          descendantId: BLANK_UUID,
        },
        { signal: new AbortController().signal }
      );

      expect(result).toMatchSnapshot();
    });
  });

  describe("get-root", () => {
    it("should get root level templates", async () => {
      const result = await GetTemplateRootTool().handler(
        {
          skip: 0,
          take: 100
        },
        { signal: new AbortController().signal }
      );

      expect(result).toMatchSnapshot();
    });
  });

  describe("get-search", () => {
    it("should search for templates by name", async () => {
      // Create a test template
      const builder = await new TemplateBuilder()
        .withName(TEST_ROOT_NAME)
        .withContent("<h1>@Model.Title</h1>")
        .create();

      const result = await GetTemplateSearchTool().handler(
        {
          query: TEST_ROOT_NAME,
          skip: 0,
          take: 100,
        },
        { signal: new AbortController().signal }
      );

      // Parse the response and verify our test template exists
      const items = JSON.parse(result.content[0].text?.toString() ?? "[]");
      const foundTemplate = Array.isArray(items.items)
        ? items.items.find((item: any) => item?.name === TEST_ROOT_NAME)
        : undefined;

      expect(foundTemplate).toBeDefined();

      // Normalize and verify response
      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();

      // Cleanup test template
      await builder.cleanup();
    });

  });
});
