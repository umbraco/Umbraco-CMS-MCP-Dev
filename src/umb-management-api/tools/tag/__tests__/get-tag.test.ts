import GetTagsTool from "../get/get-tags.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DocumentTestHelper } from "../../document/__tests__/helpers/document-test-helper.js";
import { DocumentBuilder } from "../../document/__tests__/helpers/document-builder.js";
import { TAG_DATA_TYPE_ID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_DOCUMENT_NAME = "_Test Tag Document";
const TEST_TAG_1 = "test-tag";
const NON_EXISTENT_TAG = "NonExistentTag_12345";

describe("get-tag", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should retrieve tags successfully", async () => {

    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .allowAsRoot(true)
      .withProperty("tag", "Tag", TAG_DATA_TYPE_ID)
      .create();

    const documentBuilder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(docTypeBuilder.getId())
      .withValue("tag", [TEST_TAG_1])
      .create();

    await documentBuilder.publish();

    // Test the get-tags tool with a common search term
    const result = await GetTagsTool.handler(
      {
        take: 50,
      },
      createMockRequestHandlerExtra()
    );

    // Normalize the result for snapshot testing
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return empty result when no tags match query", async () => {

    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .allowAsRoot(true)
      .withProperty("tag", "Tag", TAG_DATA_TYPE_ID)
      .create();

    const documentBuilder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(docTypeBuilder.getId())
      .withValue("tag", [TEST_TAG_1])
      .create();

    await documentBuilder.publish();

    const result = await GetTagsTool.handler(
      {
        query: NON_EXISTENT_TAG,
        take: 100,
      },
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });

  it("should return tags that match query ", async () => {

    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .allowAsRoot(true)
      .withProperty("tag", "Tag", TAG_DATA_TYPE_ID)
      .create();

    const documentBuilder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(docTypeBuilder.getId())
      .withValue("tag", [TEST_TAG_1])
      .create();

    await documentBuilder.publish();

    const result = await GetTagsTool.handler(
      {
        query: "test",
        take: 100,
      },
      createMockRequestHandlerExtra()
    );

    // Normalize the result for snapshot testing
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

});
