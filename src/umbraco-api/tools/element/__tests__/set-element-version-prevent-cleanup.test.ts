import SetElementVersionPreventCleanupTool from "../put/set-element-version-prevent-cleanup.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element for Prevent Cleanup";

describe("set-element-version-prevent-cleanup", () => {
  setupTestEnvironment();
  let builder: ElementBuilder;

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should prevent cleanup for an element version", async () => {
    // Arrange - create element and retrieve its version
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
    const result = await SetElementVersionPreventCleanupTool.handler(
      { id: versionId, preventCleanup: true },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
  });

  it("should return error for non-existent version ID", async () => {
    // Act
    const result = await SetElementVersionPreventCleanupTool.handler(
      { id: "00000000-0000-0000-0000-000000000000", preventCleanup: true },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
  });
});
