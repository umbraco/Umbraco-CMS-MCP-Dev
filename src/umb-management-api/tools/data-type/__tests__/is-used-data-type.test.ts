import IsUsedDataTypeTool from "../get/is-used-data-type.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DocumentBuilder } from "../../document/__tests__/helpers/document-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_DATATYPE_NAME = "_Test DataType IsUsed";
const TEST_DOCUMENT_TYPE_NAME = "_Test DocType For IsUsed";
const TEST_DOCUMENT_NAME = "_Test Document For IsUsed";

describe("is-used-data-type", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await Promise.all([
      DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME),
      DocumentTypeTestHelper.cleanup(TEST_DOCUMENT_TYPE_NAME),
    ]);
    console.error = originalConsoleError;
  });

  it("should check if a data type is used", async () => {
    // Create a data type
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Create a document type that uses this data type
    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_TYPE_NAME)
      .allowAsRoot(true)
      .withProperty("testProperty", "Test Property", dataTypeBuilder.getId())
      .create();

    // Create a document that uses the data type
   const documentBuilder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(docTypeBuilder.getId())
      .withValue("testProperty", "test")
      .create(); 

    await documentBuilder.publish();

    const result = await IsUsedDataTypeTool().handler(
      { id: dataTypeBuilder.getId() },
      { signal: new AbortController().signal }
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return true when data type is used in document type without documents", async () => {
    // Create a data type
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Create a document type that uses this data type, but don't create any documents
    await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_TYPE_NAME)
      .allowAsRoot(true)
      .withProperty("testProperty", "Test Property", dataTypeBuilder.getId())
      .create();

    const result = await IsUsedDataTypeTool().handler(
      { id: dataTypeBuilder.getId() },
      { signal: new AbortController().signal }
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return false when data type is not used", async () => {
    // Create a data type but don't use it in any document type
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    const result = await IsUsedDataTypeTool().handler(
      { id: dataTypeBuilder.getId() },
      { signal: new AbortController().signal }
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent data type", async () => {
    const result = await IsUsedDataTypeTool().handler(
      { id: BLANK_UUID },
      { signal: new AbortController().signal }
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});