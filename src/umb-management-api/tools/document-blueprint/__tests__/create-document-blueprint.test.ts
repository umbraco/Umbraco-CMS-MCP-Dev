import CreateDocumentBlueprintTool from "../post/create-blueprint.js";
import { DocumentBlueprintBuilder } from "./helpers/document-blueprint-builder.js";
import { DocumentBlueprintFolderBuilder } from "./helpers/document-blueprint-folder-builder.js";
import { DocumentBlueprintTestHelper } from "./helpers/document-blueprint-test-helper.js";
import { ROOT_DOCUMENT_TYPE_ID } from "../../../../constants/constants.js";
import {
  createMockRequestHandlerExtra,
  normalizeObject,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";
const TEST_BLUEPRINT_NAME = "_Test Blueprint Created";
const EXISTING_BLUEPRINT_NAME = "_Existing Blueprint";
const TEST_FOLDER_NAME = "_Test Blueprint Folder";
const TEST_BLUEPRINT_WITH_PARENT_NAME = "_Test Blueprint With Parent";

describe("create-document-blueprint", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test blueprints
    await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_NAME);
    await DocumentBlueprintTestHelper.cleanup(EXISTING_BLUEPRINT_NAME);
    await DocumentBlueprintTestHelper.cleanup(TEST_FOLDER_NAME);
    await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_WITH_PARENT_NAME);
  });

  it("should create a document blueprint", async () => {
    // Create blueprint model using builder
    const blueprintModel = new DocumentBlueprintBuilder(TEST_BLUEPRINT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .build();

    // Create the blueprint
    const result = await CreateDocumentBlueprintTool.handler(
      blueprintModel,
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();

    // Verify the created item exists and matches expected values
    const item = await DocumentBlueprintTestHelper.findDocumentBlueprint(
      TEST_BLUEPRINT_NAME
    );
    expect(item).toBeDefined();
    expect(normalizeObject(item!)).toMatchSnapshot();
  });

  it("should handle existing document blueprint", async () => {
    // Create blueprint model
    const blueprintModel = new DocumentBlueprintBuilder(EXISTING_BLUEPRINT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .build();

    // First create the blueprint
    await CreateDocumentBlueprintTool.handler(
      blueprintModel,
      createMockRequestHandlerExtra()
    );

    // Try to create it again
    const result = await CreateDocumentBlueprintTool.handler(
      blueprintModel,
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });

  it("should create a document blueprint with parent folder", async () => {
    // Arrange: Create parent folder
    const folderBuilder = await new DocumentBlueprintFolderBuilder(
      TEST_FOLDER_NAME
    ).create();

    // Arrange: Create blueprint with flattened parentId for tool
    const result = await CreateDocumentBlueprintTool.handler(
      {
        values: [],
        variants: [{
          culture: null,
          segment: null,
          name: TEST_BLUEPRINT_WITH_PARENT_NAME
        }],
        documentType: {
          id: ROOT_DOCUMENT_TYPE_ID
        },
        parentId: folderBuilder.getId()  // Flattened parent ID
      } as any,
      createMockRequestHandlerExtra()
    );

    // Assert: Verify the handler response
    expect(result).toMatchSnapshot();

    // Assert: Verify the created item exists with correct parent
    const item = await DocumentBlueprintTestHelper.findDocumentBlueprint(
      TEST_BLUEPRINT_WITH_PARENT_NAME
    );
    expect(item).toBeDefined();
    expect(item!.parent).toBeDefined();
    expect(item!.parent!.id).toBe(folderBuilder.getId());
    expect(normalizeObject(item!)).toMatchSnapshot();
  });
});
