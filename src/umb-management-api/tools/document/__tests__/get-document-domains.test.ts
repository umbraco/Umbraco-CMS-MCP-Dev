import GetDocumentDomainsTool from "../get/get-document-domains.js";
import { DocumentBuilder, TEST_DOMAIN } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { getDocumentByIdDomainsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

const TEST_DOCUMENT_NAME = "_Test DomainsDocument";

describe("get-document-domains", () => {
  setupTestEnvironment();

  let docId: string;

  beforeEach(async () => {
    // Create a document and set domains
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();
    await builder.setDomains([TEST_DOMAIN], null);
    docId = builder.getId();
  });

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should add and then get domains for a valid document", async () => {
    const result = await GetDocumentDomainsTool.handler(
      {
        id: docId,
      },
      createMockRequestHandlerExtra()
    );
    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Get the document back and check its domains
    const found = await DocumentTestHelper.findDocument(TEST_DOCUMENT_NAME);
    expect(found).toBeDefined();
    // Check if domain was added
    const domains = validateStructuredContent(result, getDocumentByIdDomainsResponse);
    expect(domains.domains).toEqual(
      expect.arrayContaining([expect.objectContaining(TEST_DOMAIN)])
    );
  });

  it("should handle non-existent document", async () => {
    const result = await GetDocumentDomainsTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );
    // Non-existent document may return error or empty domains depending on API
    if (result.isError) {
      expect(result.isError).toBe(true);
    } else {
      // API may return empty domains for non-existent document
      const data = result.structuredContent as { domains: any[] };
      expect(data.domains).toEqual([]);
    }
  });
});
