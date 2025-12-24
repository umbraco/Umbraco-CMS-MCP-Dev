import GetDocumentDomainsTool from "../get/get-document-domains.js";
import { DocumentBuilder, TEST_DOMAIN } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { getDocumentByIdDomainsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

const TEST_DOCUMENT_NAME = "_Test DomainsDocument";

describe("get-document-domains", () => {
  let originalConsoleError: typeof console.error;
  let docId: string;

  beforeEach(async () => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    // Create a document and set domains
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();
    await builder.setDomains([TEST_DOMAIN], null);
    docId = builder.getId();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
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
    expect(result.isError).toBe(true);
  });
});
