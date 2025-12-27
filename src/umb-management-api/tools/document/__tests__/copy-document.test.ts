import CopyDocumentTool from "../post/copy-document.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_DOCUMENT_NAME = "_Test Document Copy";
const TEST_DOCUMENT_COPY_NAME = "_Test Document Copy (1)";

describe("copy-document", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test documents
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_COPY_NAME);
  });

  it("should copy a document to root", async () => {
    // Create a document to copy
    const docBuilder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();

    // Copy the document to root (no parentId means root)
    const result = await CopyDocumentTool.handler(
      {
        parentId: undefined,
        idToCopy: docBuilder.getId(),
        relateToOriginal: false,
        includeDescendants: false,
      },
      createMockRequestHandlerExtra()
    );

    // Verify the handler response - copy is a void operation
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Verify the document was actually copied to root
    const copiedDoc = await DocumentTestHelper.findDocument(
      TEST_DOCUMENT_COPY_NAME
    );
    expect(copiedDoc).toBeTruthy();
    expect(copiedDoc?.parent).toBeNull();
  });

  it("should handle non-existent document", async () => {
    const result = await CopyDocumentTool.handler(
      {
        parentId: undefined,
        idToCopy: BLANK_UUID,
        relateToOriginal: false,
        includeDescendants: false,
      },
      createMockRequestHandlerExtra()
    );

    // Verify the error response
    expect(result.isError).toBe(true);
  });
});
