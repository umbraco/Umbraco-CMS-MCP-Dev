import { ROOT_DOCUMENT_TYPE_ID } from "../../../../constants/constants.js";
import GetDocumentByIdTool from "../get/get-document-by-id.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { getDocumentByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const TEST_DOCUMENT_NAME = "_Test GetDocumentById";

describe("get-document-by-id", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should get a document by ID", async () => {
    // Create a document
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .create();
    const id = builder.getId();
    // Get by ID
    const result = await GetDocumentByIdTool.handler(
      { id },
      createMockRequestHandlerExtra()
    );
    const doc = validateStructuredContent(result, getDocumentByIdResponse);
    expect(doc.id).toBe(id);
    expect(doc.variants[0].name).toBe(TEST_DOCUMENT_NAME);
  });

  it("should return error for non-existent ID", async () => {
    const result = await GetDocumentByIdTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
  });
});
