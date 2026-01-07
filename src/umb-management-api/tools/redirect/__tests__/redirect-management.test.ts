import { DocumentBuilder } from "../../document/__tests__/helpers/document-builder.js";
import { DocumentTestHelper } from "../../document/__tests__/helpers/document-test-helper.js";
import GetRedirectByIdTool from "../get/get-redirect-by-id.js";
import DeleteRedirectTool from "../delete/delete-redirect.js";
import GetAllRedirectsTool from "../get/get-all-redirects.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_DOCUMENT_NAME = "_Test Redirect Document";
const RENAMED_DOCUMENT_NAME = "_Test Redirect Document Renamed";

describe("Redirect Management Tools", () => {
  setupTestEnvironment();

  let documentId: string;
  let redirectId: string;

  beforeEach(async () => {
    // Create and publish a test document
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();

    await builder.publish();
    await builder.updateName(RENAMED_DOCUMENT_NAME);
    await builder.publish();

    documentId = builder.getId();

    // Get the redirect ID
    const result = await GetAllRedirectsTool.handler(
      {},
      createMockRequestHandlerExtra()
    );
    const data = validateToolResponse(GetAllRedirectsTool, result);
    const redirect = data.items.find((r: any) => r.document.id === documentId);
    if (!redirect) {
      throw new Error("Redirect not found after rename");
    }
    redirectId = redirect.id;
  });

  afterEach(async () => {
    // Clean up all redirects
    const result = await GetAllRedirectsTool.handler(
      {},
      createMockRequestHandlerExtra()
    );
    const data = validateToolResponse(GetAllRedirectsTool, result);
    for (const redirect of data.items) {
      await DeleteRedirectTool.handler(
        { id: redirect.id },
        createMockRequestHandlerExtra()
      );
    }

    // Clean up the test documents
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTestHelper.cleanup(RENAMED_DOCUMENT_NAME);
  });

  describe("GetRedirectByIdTool", () => {
    it("should get a redirect by ID", async () => {
      const result = await GetRedirectByIdTool.handler(
        { id: documentId },
        createMockRequestHandlerExtra()
      );

      let snapshot = createSnapshotResult(result, redirectId);
      snapshot = createSnapshotResult(snapshot, documentId);

      expect(snapshot).toMatchSnapshot();
    });
  });

  describe("DeleteRedirectTool", () => {
    it("should delete a redirect", async () => {
      const result = await DeleteRedirectTool.handler(
        { id: redirectId },
        createMockRequestHandlerExtra()
      );

      expect(result).toMatchSnapshot();

      // Verify the redirect is deleted
      const getResult = await GetRedirectByIdTool.handler(
        { id: documentId },
        createMockRequestHandlerExtra()
      );

      const snapshot = createSnapshotResult(getResult, documentId);
      expect(snapshot).toMatchSnapshot();
    });
  });
});
