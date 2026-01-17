import DeleteDocumentPublicAccessTool from "../delete/delete-document-public-access.js";
import PostDocumentPublicAccessTool from "../post/post-document-public-access.js";
import GetDocumentPublicAccessTool from "../get/get-document-public-access.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCUMENT_NAME = "_Test DeletePublicAccessDocument";

function buildPublicAccessData(docId: string) {
  return {
    loginDocument: { id: docId },
    errorDocument: { id: docId },
    memberUserNames: ["testuser"],
    memberGroupNames: ["testgroup"],
  };
}

describe("delete-document-public-access", () => {
  setupTestEnvironment();

  let docId: string;

  beforeEach(async () => {
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();
    docId = builder.getId();
    // Add public access
    await PostDocumentPublicAccessTool.handler(
      {
        id: docId,
        data: buildPublicAccessData(docId),
      },
      createMockRequestHandlerExtra()
    );
  });

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should delete public access for a valid document", async () => {
    const deleteResult = await DeleteDocumentPublicAccessTool.handler(
      { id: docId },
      createMockRequestHandlerExtra()
    );
    expect(deleteResult).toMatchSnapshot();

    // GET to verify
    const getResult = await GetDocumentPublicAccessTool.handler(
      { id: docId },
      createMockRequestHandlerExtra()
    );
    expect(getResult).toMatchSnapshot();
  });

  it("should handle non-existent document", async () => {
    const deleteResult = await DeleteDocumentPublicAccessTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );
    expect(deleteResult).toMatchSnapshot();
  });
});
