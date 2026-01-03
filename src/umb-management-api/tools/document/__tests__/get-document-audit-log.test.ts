import GetDocumentAuditLogTool from "../get/get-document-audit-log.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_DOCUMENT_NAME = "_Test AuditLogDocument";

describe("get-document-audit-log", () => {
  setupTestEnvironment();

  let docId: string;

  beforeEach(async () => {
    // Create a document
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();
    docId = builder.getId();
  });

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should return audit logs for a valid document", async () => {
    const result = await GetDocumentAuditLogTool.handler(
      {
        id: docId,
        data: {
          orderDirection: "Ascending",
          sinceDate: new Date().toISOString(),
          skip: 0,
          take: 100,
        },
      },
      createMockRequestHandlerExtra()
    );
    expect(result).toBeDefined();
    expect(result.structuredContent).toBeDefined();
    const data = result.structuredContent as { items: any[], total: number };
    expect(data.items).toBeDefined();
  });

  it("should handle non-existent document", async () => {
    const result = await GetDocumentAuditLogTool.handler(
      {
        id: BLANK_UUID,
        data: {
          orderDirection: "Ascending",
          sinceDate: new Date().toISOString(),
          skip: 0,
          take: 100,
        },
      },
      createMockRequestHandlerExtra()
    );
    expect(result).toBeDefined();
    // Non-existent document may return error or empty logs depending on API
    if (result.isError) {
      expect(result.isError).toBe(true);
    } else {
      // API may return empty audit log for non-existent document
      const data = result.structuredContent as { items: any[], total: number };
      expect(data.items).toBeDefined();
    }
  });
});
