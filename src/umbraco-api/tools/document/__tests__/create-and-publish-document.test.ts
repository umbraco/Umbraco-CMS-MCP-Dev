import CreateAndPublishDocumentTool from "../post/create-and-publish-document.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { ROOT_DOCUMENT_TYPE_ID } from "../../../../constants/constants.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  normalizeObject,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCUMENT_NAME = "_Test CreateAndPublishDocument";

describe("create-and-publish-document", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should create and publish an invariant document using the default culturesToPublish", async () => {
    // Arrange: invariant document type, culturesToPublish omitted entirely.
    // Umbraco only accepts real culture codes for culturesToPublish (wildcards/nulls are
    // rejected), so for invariant content the tool must default to an empty array to
    // publish the single invariant variant.
    const docModel = {
      documentTypeId: ROOT_DOCUMENT_TYPE_ID,
      name: TEST_DOCUMENT_NAME,
      parentId: undefined,
      templateId: undefined,
      cultures: undefined,
      culturesToPublish: undefined,
      values: [],
    };

    // Act
    const result = await CreateAndPublishDocumentTool.handler(docModel, createMockRequestHandlerExtra());

    // Assert
    const responseData = validateToolResponse(CreateAndPublishDocumentTool, result);
    const documentId = responseData.id;
    expect(createSnapshotResult(result, documentId)).toMatchSnapshot();

    const item = await DocumentTestHelper.findDocument(TEST_DOCUMENT_NAME);
    expect(item).toBeDefined();
    const norm = {
      ...normalizeObject(item!),
      createDate: "NORMALIZED_DATE",
    };
    expect(norm).toMatchSnapshot();

    const isPublished = item!.variants.some((v: any) => v.state === "Published");
    expect(isPublished).toBe(true);
  });

  it("should create and publish an invariant document with an explicit empty culturesToPublish array", async () => {
    // Arrange
    const docModel = {
      documentTypeId: ROOT_DOCUMENT_TYPE_ID,
      name: TEST_DOCUMENT_NAME,
      parentId: undefined,
      templateId: undefined,
      cultures: undefined,
      culturesToPublish: [],
      values: [],
    };

    // Act
    const result = await CreateAndPublishDocumentTool.handler(docModel, createMockRequestHandlerExtra());

    // Assert
    const responseData = validateToolResponse(CreateAndPublishDocumentTool, result);
    expect(createSnapshotResult(result, responseData.id)).toMatchSnapshot();

    const item = await DocumentTestHelper.findDocument(TEST_DOCUMENT_NAME);
    expect(item).toBeDefined();
    const isPublished = item!.variants.some((v: any) => v.state === "Published");
    expect(isPublished).toBe(true);
  });
});
