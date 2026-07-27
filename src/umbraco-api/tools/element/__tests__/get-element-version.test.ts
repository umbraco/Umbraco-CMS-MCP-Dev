import GetElementVersionTool from "../get/get-element-version.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element for Versions";

/**
 * The element version response includes `element.id` which is the element's UUID.
 * Since `element` is not in SDK's ID_REFERENCE_FIELDS, we normalize it manually.
 */
function normalizeElementVersionResult(result: any, elementId: string): any {
  const normalized = createSnapshotResult(result);
  if (normalized?.structuredContent?.items) {
    normalized.structuredContent.items = normalized.structuredContent.items.map((item: any) => ({
      ...item,
      element: item.element ? { ...item.element, id: BLANK_UUID } : item.element,
    }));
  }
  return normalized;
}

describe("get-element-version", () => {
  setupTestEnvironment();
  let builder: ElementBuilder;

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should list element versions", async () => {
    // Arrange - create element then update it to generate a version
    builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    const elementId = builder.getId();
    const client = UmbracoManagementClient.getClient();

    // Fetch the full element to get values/variants for update
    const fullElement = await client.getElementById(elementId) as any;

    // Update the element to create a new version
    await client.putElementById(elementId, {
      values: fullElement.values || [],
      variants: fullElement.variants || [],
    } as any);

    // Act
    const result = await GetElementVersionTool.handler(
      { elementId, culture: undefined },
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedResult = normalizeElementVersionResult(result, elementId);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return error for non-existent element ID", async () => {
    // Act
    const result = await GetElementVersionTool.handler(
      { elementId: "00000000-0000-0000-0000-000000000000", culture: undefined },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
  });
});
