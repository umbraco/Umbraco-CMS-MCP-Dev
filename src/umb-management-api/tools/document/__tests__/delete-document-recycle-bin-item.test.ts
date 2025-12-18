import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import DeleteDocumentRecycleBinItemTool from "../delete/delete-recycle-bin-item.js";
import { jest } from "@jest/globals";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_DOCUMENT_NAME = "_Test Document Recycle Bin Delete";

describe("delete-document-recycle-bin-item", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(async () => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    await DocumentTestHelper.emptyRecycleBin();
  });

  afterEach(async () => {
    await DocumentTestHelper.emptyRecycleBin();
    console.error = originalConsoleError;
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
      { signal: new AbortController().signal }
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
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
