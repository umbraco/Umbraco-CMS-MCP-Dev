import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import GetDocumentAvailableSegmentOptionsTool from "../get/get-document-available-segment-options.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_DOCUMENT_NAME = "_Test Document Segment Options";

describe("get-document-available-segment-options", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should get available segment options for document", async () => {
    // Arrange - Create a document
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();

    // Act - Get available segment options
    const result = await GetDocumentAvailableSegmentOptionsTool.handler(
      {
        id: builder.getId(),
        skip: 0,
        take: 100,
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent document", async () => {
    // Act
    const result = await GetDocumentAvailableSegmentOptionsTool.handler(
      {
        id: BLANK_UUID,
        skip: 0,
        take: 100,
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
