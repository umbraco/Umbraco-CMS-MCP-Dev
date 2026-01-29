import { TemplateTestHelper } from "./helpers/template-helper.js";
import GetTemplateAncestorsTool from "../items/get/get-ancestors.js";
import GetTemplateChildrenTool from "../items/get/get-children.js";
import GetTemplateRootTool from "../items/get/get-root.js";
import GetTemplateSearchTool from "../items/get/get-search.js";
import { TemplateBuilder } from "./helpers/template-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("template-tree", () => {
  const TEST_ROOT_NAME = "_Test Root Template";
  const TEST_CHILD_NAME = "_Test Child Template";
  const TEST_PARENT_NAME = "_Test Parent Template";

  setupTestEnvironment();

  afterEach(async () => {
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

      const result = await GetTemplateChildrenTool.handler(
        {
          skip: undefined,
          take: 100,
          parentId: parentBuilder.getId(),
        },
        createMockRequestHandlerExtra()
      );

      // Validate response and snapshot
      const data = validateToolResponse(GetTemplateChildrenTool, result);
      expect(data).toBeDefined();
      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();
    });

    it("should handle non-existent parent", async () => {
      const result = await GetTemplateChildrenTool.handler(
        {
          skip: undefined,
          take: 100,
          parentId: BLANK_UUID,
        },
        createMockRequestHandlerExtra()
      );

      // API returns empty results for non-existent parent, not an error
      expect(result.isError).toBeFalsy();
      expect(createSnapshotResult(result)).toMatchSnapshot();
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

      const result = await GetTemplateAncestorsTool.handler(
        {
          descendantId: childBuilder.getId(),
        },
        createMockRequestHandlerExtra()
      );

      // Validate response and snapshot
      const data = validateToolResponse(GetTemplateAncestorsTool, result);
      expect(data).toBeDefined();
      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();

      // Cleanup child template
      await childBuilder.cleanup();
      // Cleanup parent template
      await parentBuilder.cleanup();
    });

    it("should handle non-existent item", async () => {
      const result = await GetTemplateAncestorsTool.handler(
        {
          descendantId: BLANK_UUID,
        },
        createMockRequestHandlerExtra()
      );

      // API returns empty results for non-existent item, not an error
      expect(result.isError).toBeFalsy();
      expect(createSnapshotResult(result)).toMatchSnapshot();
    });
  });

  describe("get-root", () => {
    it("should get root level templates", async () => {
      const result = await GetTemplateRootTool.handler(
        {
          skip: 0,
          take: 100
        },
        createMockRequestHandlerExtra()
      );

      const data = validateToolResponse(GetTemplateRootTool, result);
      expect(data).toBeDefined();
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

      const result = await GetTemplateSearchTool.handler(
        {
          query: TEST_ROOT_NAME,
          skip: 0,
          take: 100,
        },
        createMockRequestHandlerExtra()
      );

      // Parse the response and verify our test template exists
      const data = validateToolResponse(GetTemplateSearchTool, result);
      const foundTemplate = Array.isArray(data.items)
        ? data.items.find((item: any) => item?.name === TEST_ROOT_NAME)
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
