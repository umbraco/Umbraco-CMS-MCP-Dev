import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import GetItemDocumentTool from "../get/get-item-document.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_DOCUMENT_1_NAME = "_Test Document Item 1";
const TEST_DOCUMENT_2_NAME = "_Test Document Item 2";

describe("get-item-document", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_1_NAME);
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_2_NAME);
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
      createMockRequestHandlerExtra()
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
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
