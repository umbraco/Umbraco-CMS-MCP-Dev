import GetDocumentTypeAllowedAtRootTool from "../get/get-document-type-allowed-at-root.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import { DocumentTypeResponseModel } from "@/umb-management-api/schemas/index.js";
import { getDocumentTypeAllowedAtRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_DOCTYPE_NAME = "_Test DocumentType Root";

describe("get-document-type-allowed-at-root", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test document types
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
  });

  it("should get document types allowed at root", async () => {
    // Create test document types
    await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .allowAsRoot(true)
      .create();

    // Get document types allowed at root
    const result = await GetDocumentTypeAllowedAtRootTool.handler(
      {
        skip: 0,
        take: 10,
      } as any, createMockRequestHandlerExtra()
    );

    // Parse and find our test document type
    const parsed = validateStructuredContent(result, getDocumentTypeAllowedAtRootResponse) as unknown as {
      items: DocumentTypeResponseModel[];
    };
    const testDocType = parsed.items.find(
      (item) => item.name === TEST_DOCTYPE_NAME
    );

    if (!testDocType) {
      throw new Error("Test document type not found in results");
    }

    // Normalize the ID
    testDocType.id = BLANK_UUID;

    // Verify just the test document type
    expect(testDocType).toMatchSnapshot();
  });
});
