import UpdateAndPublishDocumentTool from "../put/update-and-publish-document.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { ROOT_DOCUMENT_TYPE_ID } from "../../../../constants/constants.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("update-and-publish-document", () => {
  const TEST_DOCUMENT_NAME = "_Test UpdateAndPublishDocument";
  const UPDATED_DOCUMENT_NAME = "_Test UpdateAndPublishDocument Updated";
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTestHelper.cleanup(UPDATED_DOCUMENT_NAME);
  });

  it("should update and publish an invariant document with an empty culturesToPublish array", async () => {
    // Arrange: create an unpublished invariant document.
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .create();

    // Umbraco only accepts real culture codes for culturesToPublish (wildcards/nulls are
    // rejected). For invariant content, an empty array publishes the invariant variant.
    const updateModel = new DocumentBuilder()
      .withName(UPDATED_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .build();

    // Act
    const result = await UpdateAndPublishDocumentTool.handler(
      {
        id: builder.getId(),
        data: { ...updateModel, culturesToPublish: [] },
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();

    const found = await DocumentTestHelper.findDocument(UPDATED_DOCUMENT_NAME);
    expect(found).toBeDefined();
    expect(found!.id).toBe(builder.getId());
    const isPublished = found!.variants.some((v: any) => v.state === "Published");
    expect(isPublished).toBe(true);
  });

  it("should handle updating and publishing a non-existent document", async () => {
    const updateModel = new DocumentBuilder()
      .withName(UPDATED_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .build();

    const result = await UpdateAndPublishDocumentTool.handler(
      {
        id: BLANK_UUID,
        data: { ...updateModel, culturesToPublish: [] },
      },
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });
});
