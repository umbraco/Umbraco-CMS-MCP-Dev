import GetReferencesDataTypeTool from "../get/get-references-data-type.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_DATATYPE_NAME = "_Test DataType References";
const TEST_DOCUMENT_TYPE_NAME = "_Test DocType For References";

describe("get-references-data-type", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await Promise.all([
      DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME),
      DocumentTypeTestHelper.cleanup(TEST_DOCUMENT_TYPE_NAME),
    ]);
  });

  it("should get references for a data type used in document type property", async () => {
    // Create a data type
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Create a document type that uses this data type
    await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_TYPE_NAME)
      .allowAsRoot(true)
      .withProperty("testProperty", "Test Property", dataTypeBuilder.getId())
      .create();

    const result = await GetReferencesDataTypeTool.handler(
      { id: dataTypeBuilder.getId() },
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return empty array for unreferenced data type", async () => {
    // Create a data type that won't be referenced
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    const result = await GetReferencesDataTypeTool.handler(
      { id: dataTypeBuilder.getId() },
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent data type", async () => {
    const result = await GetReferencesDataTypeTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});