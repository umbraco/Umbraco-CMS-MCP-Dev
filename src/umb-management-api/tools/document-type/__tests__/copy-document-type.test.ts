import CopyDocumentTypeTool from "../post/copy-document-type.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import { DocumentTypeFolderBuilder } from "./helpers/document-type-folder-builder.js";
import { createMockRequestHandlerExtra, validateErrorResult } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_DOCTYPE_NAME = "_Test DocumentType Copy";
const TEST_DOCTYPE_COPY_NAME = "_Test DocumentType Copy (copy)";
const TEST_FOLDER_NAME = "_Test Folder For Copy";

describe("copy-document-type", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test document types and folders
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_COPY_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_FOLDER_NAME);
  });

  it("should copy a document type to a folder", async () => {
    // Arrange - Create a document type to copy
    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();

    // Arrange - Create a target folder
    const folderBuilder = await new DocumentTypeFolderBuilder(
      TEST_FOLDER_NAME
    ).create();

    // Act - Copy the document type
    const result = await CopyDocumentTypeTool.handler(
      {
        id: docTypeBuilder.getId(),
        data: {
          target: {
            id: folderBuilder.getId(),
          },
        },
      } as any,
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the handler response returns the new ID
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Assert - Verify the document type was actually copied to the folder
    const copiedDocType = await DocumentTypeTestHelper.findDocumentType(
      TEST_DOCTYPE_COPY_NAME
    );
    expect(copiedDocType).toBeTruthy();
    expect(copiedDocType?.parent?.id).toBe(folderBuilder.getId());
  });

  it("should copy a document type to root", async () => {
    // Arrange - Create a document type to copy
    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();

    // Act - Copy the document type to root (no target)
    const result = await CopyDocumentTypeTool.handler(
      {
        id: docTypeBuilder.getId(),
        data: {
          target: null,
        },
      } as any,
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the handler response returns the new ID
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Assert - Verify the document type was actually copied to root
    const copiedDocType = await DocumentTypeTestHelper.findDocumentType(
      TEST_DOCTYPE_COPY_NAME
    );
    expect(copiedDocType).toBeTruthy();
    expect(copiedDocType?.parent).toBeNull();
  });

  it("should handle non-existent document type", async () => {
    // Act - Try to copy non-existent document type
    const result = await CopyDocumentTypeTool.handler(
      {
        id: BLANK_UUID,
        data: {
          target: null,
        },
      } as any,
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the error response
    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });
});
