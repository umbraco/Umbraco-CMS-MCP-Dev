import RollbackElementVersionTool from "../post/rollback-element-version.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  createMockRequestHandlerExtra,
  normalizeErrorResponse,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element for Rollback";

describe("rollback-element-version", () => {
  setupTestEnvironment();
  let builder: ElementBuilder;

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should rollback element to a specific version", async () => {
    // Arrange - create element and update to create multiple versions
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

    // Fetch versions to get a version ID to rollback to
    const versionsResponse = await client.getElementVersion({ elementId }) as any;
    expect(versionsResponse.items.length).toBeGreaterThan(0);
    const versionId = versionsResponse.items[0].id;

    // Act
    const result = await RollbackElementVersionTool.handler(
      { id: versionId, culture: undefined },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
  });

  it("should return error for non-existent version ID", async () => {
    // Act
    const result = await RollbackElementVersionTool.handler(
      { id: "00000000-0000-0000-0000-000000000000", culture: undefined },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
    const normalizedResult = normalizeErrorResponse(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
