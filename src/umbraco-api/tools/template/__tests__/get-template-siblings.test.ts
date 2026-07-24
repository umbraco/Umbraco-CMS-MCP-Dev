import { TemplateTestHelper } from "./helpers/template-helper.js";
import GetTemplateSiblingsTool from "../items/get/get-siblings.js";
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

describe("get-template-siblings", () => {
  const TEST_PARENT_NAME = "_Test Parent Template for Siblings";
  const TEST_SIBLING_1_NAME = "_Test Sibling 1 Template";
  const TEST_SIBLING_2_NAME = "_Test Sibling 2 Template";
  const TEST_TARGET_NAME = "_Test Target Template";

  setupTestEnvironment();

  afterEach(async () => {
    await TemplateTestHelper.cleanup(TEST_SIBLING_1_NAME);
    await TemplateTestHelper.cleanup(TEST_SIBLING_2_NAME);
    await TemplateTestHelper.cleanup(TEST_TARGET_NAME);
    await TemplateTestHelper.cleanup(TEST_PARENT_NAME);
  });

  it("should get sibling templates", async () => {
    // Arrange: Create a parent template with multiple children
    const parentBuilder = await new TemplateBuilder()
      .withName(TEST_PARENT_NAME)
      .create();

    // Create first sibling
    await new TemplateBuilder()
      .withName(TEST_SIBLING_1_NAME)
      .withParent(parentBuilder.getId())
      .create();

    // Create target template
    const targetBuilder = await new TemplateBuilder()
      .withName(TEST_TARGET_NAME)
      .withParent(parentBuilder.getId())
      .create();

    // Create second sibling
    await new TemplateBuilder()
      .withName(TEST_SIBLING_2_NAME)
      .withParent(parentBuilder.getId())
      .create();

    // Act: Get siblings for the target template
    const result = await GetTemplateSiblingsTool.handler(
      {
        target: targetBuilder.getId(),
        before: undefined,
        after: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Assert: Verify response
    const data = validateToolResponse(GetTemplateSiblingsTool, result);
    expect(data).toBeDefined();
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent template", async () => {
    // Arrange: Use a non-existent ID
    const nonExistentId = BLANK_UUID;

    // Act: Try to get siblings for non-existent template
    const result = await GetTemplateSiblingsTool.handler(
      {
        target: nonExistentId,
        before: undefined,
        after: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Assert: Verify error response
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
