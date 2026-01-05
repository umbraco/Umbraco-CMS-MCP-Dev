import PutDocumentDomainsTool from "../put/put-document-domains.js";
import { DocumentBuilder, TEST_DOMAIN } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import GetDocumentDomainsTool from "../get/get-document-domains.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

const TEST_DOCUMENT_NAME = "_Test PutDomainsDocument";

describe("put-document-domains", () => {
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

  it("should add a domain for a valid document", async () => {
    const result = await PutDocumentDomainsTool.handler(
      {
        id: docId,
        data: { defaultIsoCode: null, domains: [TEST_DOMAIN] },
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Get the domains back to verify
    const getResult = await GetDocumentDomainsTool.handler(
      {
        id: docId,
      },
      createMockRequestHandlerExtra()
    );

    const domains = validateToolResponse(GetDocumentDomainsTool, getResult);
    expect(domains.domains).toEqual(
      expect.arrayContaining([expect.objectContaining(TEST_DOMAIN)])
    );
  });

  it("should handle non-existent document", async () => {
    const result = await PutDocumentDomainsTool.handler(
      {
        id: BLANK_UUID,
        data: { defaultIsoCode: "en", domains: [TEST_DOMAIN] },
      },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
  });
});
