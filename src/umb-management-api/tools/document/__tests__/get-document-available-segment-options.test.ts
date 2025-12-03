import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import GetDocumentAvailableSegmentOptionsTool from "../get/get-document-available-segment-options.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_DOCUMENT_NAME = "_Test Document Segment Options";

describe("get-document-available-segment-options", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    console.error = originalConsoleError;
  });

  it("should get available segment options for document", async () => {
    // Arrange - Create a document
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();

    // Act - Get available segment options
    const result = await GetDocumentAvailableSegmentOptionsTool().handler(
      {
        id: builder.getId(),
        skip: 0,
        take: 100,
      },
      { signal: new AbortController().signal }
    );

    // Assert
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent document", async () => {
    // Act
    const result = await GetDocumentAvailableSegmentOptionsTool().handler(
      {
        id: BLANK_UUID,
        skip: 0,
        take: 100,
      },
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
