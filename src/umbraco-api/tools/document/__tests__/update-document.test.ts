import UpdateDocumentTool from "../put/update-document.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { ROOT_DOCUMENT_TYPE_ID } from "../../../../constants/constants.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("update-document", () => {
  const TEST_DOCUMENT_NAME = "_Test Document Update";
  const UPDATED_DOCUMENT_NAME = "_Test Document Updated";
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test documents
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTestHelper.cleanup(UPDATED_DOCUMENT_NAME);
  });

  it("should update a document", async () => {
    // Create a document to update
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .create();

    // Create update model using builder
    const updateModel = new DocumentBuilder()
      .withName(UPDATED_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .build();

    // Update the document
    const result = await UpdateDocumentTool.handler(
      {
        id: builder.getId(),
        data: updateModel,
        confirmClearValues: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();

    // Verify the document was updated
    const found = await DocumentTestHelper.findDocument(UPDATED_DOCUMENT_NAME);
    expect(found).toBeDefined();
    expect(found!.id).toBe(builder.getId());
    expect(DocumentTestHelper.getNameFromItem(found!)).toBe(
      UPDATED_DOCUMENT_NAME
    );
  });

  it("should handle non-existent document", async () => {
    const updateModel = new DocumentBuilder()
      .withName(UPDATED_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .build();

    const result = await UpdateDocumentTool.handler(
      {
        id: BLANK_UUID,
        data: updateModel,
        confirmClearValues: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });

  it("should update document with properties", async () => {
    // Create a document to update
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .create();

    // Create update model with additional properties
    const updateModel = new DocumentBuilder()
      .withName(UPDATED_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .withValue("title", "Updated Title")
      .build();

    // Update the document
    const result = await UpdateDocumentTool.handler(
      {
        id: builder.getId(),
        data: updateModel,
        confirmClearValues: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();

    // Verify the document was updated with properties
    const found = await DocumentTestHelper.findDocument(UPDATED_DOCUMENT_NAME);
    expect(found).toBeDefined();
    expect(found!.id).toBe(builder.getId());
    expect(DocumentTestHelper.getNameFromItem(found!)).toBe(
      UPDATED_DOCUMENT_NAME
    );
    // Add property verification if needed
  });

  it("should reject an empty values array when the document has existing values (regression for #253)", async () => {
    const INITIAL_TITLE = "_Initial Title";

    // Create a document with a property value set
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .withValue("title", INITIAL_TITLE)
      .create();

    // Attempt to update with an empty "values" array (the footgun from #253) - no confirmClearValues
    const updateModel = new DocumentBuilder()
      .withName(UPDATED_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .build();

    const result = await UpdateDocumentTool.handler(
      {
        id: builder.getId(),
        data: updateModel,
        confirmClearValues: undefined,
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
    const responseData = result.structuredContent as { title: string };
    expect(responseData.title).toBe("This update would clear all property values");

    // The document's values must remain untouched - the update must not have gone through
    const client = UmbracoManagementClient.getClient();
    const document = await client.getDocumentById(builder.getId());
    const titleValue = document.values.find((v) => v.alias === "title");
    expect(titleValue?.value).toBe(INITIAL_TITLE);
  });

  it("should allow clearing values when confirmClearValues is true", async () => {
    const INITIAL_TITLE = "_Initial Title";

    // Create a document with a property value set
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .withValue("title", INITIAL_TITLE)
      .create();

    const updateModel = new DocumentBuilder()
      .withName(UPDATED_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .build();

    const result = await UpdateDocumentTool.handler(
      {
        id: builder.getId(),
        data: updateModel,
        confirmClearValues: true,
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBeUndefined();

    // The values must actually have been cleared
    const client = UmbracoManagementClient.getClient();
    const document = await client.getDocumentById(builder.getId());
    expect(document.values.find((v) => v.alias === "title")).toBeUndefined();
  });
});
