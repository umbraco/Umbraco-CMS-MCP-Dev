import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import DeleteDocumentRecycleBinItemTool from "../delete/delete-recycle-bin-item.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCUMENT_NAME = "_Test Document Recycle Bin Delete";

describe("delete-document-recycle-bin-item", () => {

  setupTestEnvironment();

  beforeEach(async () => {
    await DocumentTestHelper.emptyRecycleBin();
  });

  afterEach(async () => {
    await DocumentTestHelper.emptyRecycleBin();
  });

  it("should permanently delete document from recycle bin", async () => {
    // Arrange - Create document and move to recycle bin
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();

    await builder.moveToRecycleBin();

    // Find document in recycle bin
    const documentInBin = await DocumentTestHelper.findDocumentInRecycleBin(
      TEST_DOCUMENT_NAME
    );
    expect(documentInBin).toBeDefined();

    // Act - Permanently delete from recycle bin
    const result = await DeleteDocumentRecycleBinItemTool.handler(
      {
        id: documentInBin!.id,
      },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify success response
    expect(result).toMatchSnapshot();

    // Verify document is no longer in recycle bin
    const deletedDocument = await DocumentTestHelper.findDocumentInRecycleBin(
      TEST_DOCUMENT_NAME
    );
    expect(deletedDocument).toBeUndefined();
  });

  it("should handle non-existent document in recycle bin", async () => {
    // Act
    const result = await DeleteDocumentRecycleBinItemTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
