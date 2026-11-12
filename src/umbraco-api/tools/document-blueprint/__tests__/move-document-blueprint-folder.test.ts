import MoveFolderTool from "../folders/put/move-folder.js";
import { DocumentBlueprintFolderBuilder } from "./helpers/document-blueprint-folder-builder.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateErrorResult,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test Move DocumentBlueprint Folder";
const TEST_TARGET_FOLDER_NAME = "_Test Move DocumentBlueprint Folder Target";

describe("move-document-blueprint-folder", () => {
  setupTestEnvironment();

  // Delete by id (child first) so nested folders are cleaned up regardless of where the move left them.
  const createdIds: string[] = [];

  afterEach(async () => {
    const client = UmbracoManagementClient.getClient();
    for (const id of createdIds.reverse()) {
      try {
        await client.deleteDocumentBlueprintFolderById(id);
      } catch {
        // already gone
      }
    }
    createdIds.length = 0;
  });

  const ancestorIds = async (id: string): Promise<string[]> => {
    const client = UmbracoManagementClient.getClient();
    const ancestors = await client.getTreeDocumentBlueprintAncestors({ descendantId: id });
    return ancestors.map((a) => a.id);
  };

  it("should move a folder into another folder", async () => {
    // Arrange
    const target = await new DocumentBlueprintFolderBuilder(TEST_TARGET_FOLDER_NAME).create();
    createdIds.push(target.getId());
    const folder = await new DocumentBlueprintFolderBuilder(TEST_FOLDER_NAME).create();
    createdIds.push(folder.getId());

    // Act
    const result = await MoveFolderTool.handler(
      { id: folder.getId(), data: { target: { id: target.getId() } } },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
    expect(await ancestorIds(folder.getId())).toContain(target.getId());
  });

  it("should move a folder back to the root", async () => {
    // Arrange
    const parent = await new DocumentBlueprintFolderBuilder(TEST_TARGET_FOLDER_NAME).create();
    createdIds.push(parent.getId());
    const folder = await new DocumentBlueprintFolderBuilder(TEST_FOLDER_NAME).withParent(parent.getId()).create();
    createdIds.push(folder.getId());

    // Act
    const result = await MoveFolderTool.handler(
      { id: folder.getId(), data: { target: null } },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBeFalsy();
    expect(await ancestorIds(folder.getId())).not.toContain(parent.getId());
  });

  it("should handle non-existent folder", async () => {
    // Act
    const result = await MoveFolderTool.handler(
      { id: BLANK_UUID, data: { target: null } },
      createMockRequestHandlerExtra()
    );

    // Assert
    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });
});
