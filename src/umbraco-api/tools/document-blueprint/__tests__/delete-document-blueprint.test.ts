import DeleteDocumentBlueprintTool from "../delete/delete-blueprint.js";
import { DocumentBlueprintBuilder } from "./helpers/document-blueprint-builder.js";
import { DocumentBlueprintTestHelper } from "./helpers/document-blueprint-test-helper.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";
describe("delete-document-blueprint", () => {
  const TEST_BLUEPRINT_NAME = "_Test Blueprint Delete";
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any remaining test blueprints
    await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_NAME);
  });

  it("should delete a document blueprint", async () => {
    // Create a blueprint to delete
    const builder = await new DocumentBlueprintBuilder(
      TEST_BLUEPRINT_NAME
    ).create();

    // Delete the blueprint
    const result = await DeleteDocumentBlueprintTool.handler(
      {
        id: builder.getId(),
      },
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();

    // Verify the blueprint no longer exists
    const found = await DocumentBlueprintTestHelper.findDocumentBlueprint(
      TEST_BLUEPRINT_NAME
    );
    expect(found).toBeUndefined();
  });

  it("should handle non-existent document blueprint", async () => {
    const result = await DeleteDocumentBlueprintTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});
