import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import GetDocumentTypeSiblingsTool from "../items/get/get-siblings.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra, getResultText } from "@/test-helpers/create-mock-request-handler-extra.js";
import { DocumentTypeFolderBuilder } from "./helpers/document-type-folder-builder.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";

describe("get-document-type-siblings", () => {
  const TEST_FOLDER_NAME = "_Test Folder for Siblings";
  const TEST_SIBLING_1_NAME = "_Test Sibling 1";
  const TEST_SIBLING_2_NAME = "_Test Sibling 2";
  const TEST_TARGET_NAME = "_Test Target DocumentType";
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTypeTestHelper.cleanup(TEST_SIBLING_1_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_SIBLING_2_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_TARGET_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_FOLDER_NAME);
  });

  it("should get sibling document types", async () => {
    // Arrange: Create a parent folder with multiple children
    const folderBuilder = await new DocumentTypeFolderBuilder(
      TEST_FOLDER_NAME
    ).create();

    // Create first sibling
    await new DocumentTypeBuilder()
      .withName(TEST_SIBLING_1_NAME)
      .withParentId(folderBuilder.getId())
      .create();

    // Create target document type
    const targetBuilder = await new DocumentTypeBuilder()
      .withName(TEST_TARGET_NAME)
      .withParentId(folderBuilder.getId())
      .create();

    // Create second sibling
    await new DocumentTypeBuilder()
      .withName(TEST_SIBLING_2_NAME)
      .withParentId(folderBuilder.getId())
      .create();

    // Act: Get siblings for the target document type
    const result = await GetDocumentTypeSiblingsTool.handler(
      {
        target: targetBuilder.getId(),
      } as any, createMockRequestHandlerExtra()
    );

    // Assert: Verify response
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent document type", async () => {
    // Arrange: Use a non-existent ID
    const nonExistentId = BLANK_UUID;

    // Act: Try to get siblings for non-existent document type
    const result = await GetDocumentTypeSiblingsTool.handler(
      {
        target: nonExistentId,
      } as any, createMockRequestHandlerExtra()
    );

    // Assert: Verify error response
    expect(result).toMatchSnapshot();
  });
});
