import RestoreFromRecycleBinTool from "../put/restore-from-recycle-bin.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("restore-document-from-recycle-bin", () => {
  setupTestEnvironment();

  const TEST_DOCUMENT_NAME = "_Test Document Restore";

  beforeEach(async () => {
    await DocumentTestHelper.emptyRecycleBin();
  });

  afterEach(async () => {
    // Clean up any test documents
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should restore a document from recycle bin", async () => {
    // Create a document and move it to recycle bin
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();

    await builder.moveToRecycleBin();

    // Restore from recycle bin
    const result = await RestoreFromRecycleBinTool.handler(
      {
        id: builder.getId(),
      },
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();

    // Verify the document is back in the normal tree
    const found = await DocumentTestHelper.findDocument(TEST_DOCUMENT_NAME);
    expect(found).toBeDefined();
    expect(found!.variants[0].name).toBe(TEST_DOCUMENT_NAME);
  });

  it("should handle non-existent document", async () => {
    const result = await RestoreFromRecycleBinTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});
