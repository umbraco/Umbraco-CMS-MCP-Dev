import GetElementVersionByIdTool from "../get/get-element-version-by-id.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  normalizeErrorResponse,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element for Version By ID";

/**
 * The element version detail response includes `element.id` which is the element's UUID.
 * Since `element` is not in SDK's ID_REFERENCE_FIELDS, we normalize it manually.
 */
function normalizeElementVersionByIdResult(result: any): any {
  const normalized = createSnapshotResult(result);
  if (normalized?.structuredContent?.element) {
    normalized.structuredContent.element = {
      ...normalized.structuredContent.element,
      id: BLANK_UUID,
    };
  }
  return normalized;
}

describe("get-element-version-by-id", () => {
  setupTestEnvironment();
  let builder: ElementBuilder;

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should get element version by ID", async () => {
    // Arrange - create element then retrieve its versions
    builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    const elementId = builder.getId();
    const client = UmbracoManagementClient.getClient();

    // Fetch versions to get a version ID
    const versionsResponse = await client.getElementVersion({ elementId }) as any;
    expect(versionsResponse.items.length).toBeGreaterThan(0);
    const versionId = versionsResponse.items[0].id;

    // Act
    const result = await GetElementVersionByIdTool.handler(
      { id: versionId },
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedResult = normalizeElementVersionByIdResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return error for non-existent version ID", async () => {
    // Act
    const result = await GetElementVersionByIdTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
    const normalizedResult = normalizeErrorResponse(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
