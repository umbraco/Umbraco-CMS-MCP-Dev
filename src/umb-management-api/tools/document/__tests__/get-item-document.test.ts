import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import GetItemDocumentTool from "../get/get-item-document.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_DOCUMENT_1_NAME = "_Test Document Item 1";
const TEST_DOCUMENT_2_NAME = "_Test Document Item 2";

describe("get-item-document", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_1_NAME);
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_2_NAME);
    console.error = originalConsoleError;
  });

  it("should get document items by ids", async () => {
    // Arrange - Create two documents
    const builder1 = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_1_NAME)
      .withRootDocumentType()
      .create();

    const builder2 = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_2_NAME)
      .withRootDocumentType()
      .create();

    // Act - Get documents by their IDs
    const result = await GetItemDocumentTool.handler(
      {
        id: [builder1.getId(), builder2.getId()],
      },
      { signal: new AbortController().signal }
    );

    // Assert
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent document ids", async () => {
    // Act
    const result = await GetItemDocumentTool.handler(
      {
        id: [BLANK_UUID],
      },
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
