import GetReferencesDataTypeTool from "../get/get-references-data-type.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import {
  BLANK_UUID,
  encodeCursor,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
  type CursorPaginatedResult,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DATATYPE_NAME = "_Test DataType References";
const TEST_DOCUMENT_TYPE_NAME = "_Test DocType For References";
const TEST_DOCUMENT_TYPE_NAME_2 = "_Test DocType For References 2";

describe("get-references-data-type", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Delete sequentially: deleting multiple content types concurrently against the
    // same demo database can trigger transient SQL Server deadlocks.
    await DocumentTypeTestHelper.cleanup(TEST_DOCUMENT_TYPE_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_DOCUMENT_TYPE_NAME_2);
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
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

  it("should page through references using a cursor when there are more than fit on one page", async () => {
    // Create a data type referenced by two separate document types
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_TYPE_NAME)
      .allowAsRoot(true)
      .withProperty("testProperty", "Test Property", dataTypeBuilder.getId())
      .create();

    await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_TYPE_NAME_2)
      .allowAsRoot(true)
      .withProperty("testPropertyTwo", "Test Property Two", dataTypeBuilder.getId())
      .create();

    // Request a page size of 1 (via a crafted cursor) so the two references span two pages
    const firstResult = await GetReferencesDataTypeTool.handler(
      { id: dataTypeBuilder.getId(), cursor: encodeCursor({ s: 0, t: 1 }) },
      createMockRequestHandlerExtra()
    );
    const firstPage = validateToolResponse(GetReferencesDataTypeTool, firstResult) as CursorPaginatedResult;

    expect(firstPage.total).toBe(2);
    expect(firstPage.items).toHaveLength(1);
    expect(firstPage.nextCursor).toBeDefined();

    const secondResult = await GetReferencesDataTypeTool.handler(
      { id: dataTypeBuilder.getId(), cursor: firstPage.nextCursor },
      createMockRequestHandlerExtra()
    );
    const secondPage = validateToolResponse(GetReferencesDataTypeTool, secondResult) as CursorPaginatedResult;

    expect(secondPage.total).toBe(2);
    expect(secondPage.items).toHaveLength(1);
    expect(secondPage.nextCursor).toBeFalsy();

    // The two pages together should cover both referencing document types, with no overlap
    const firstAliases = (firstPage.items as any[]).map((i) => i.documentType.alias);
    const secondAliases = (secondPage.items as any[]).map((i) => i.documentType.alias);
    expect(new Set([...firstAliases, ...secondAliases]).size).toBe(2);
  });

  it("should return an empty page when the cursor skip is beyond the available references", async () => {
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    const result = await GetReferencesDataTypeTool.handler(
      { id: dataTypeBuilder.getId(), cursor: encodeCursor({ s: 10000, t: 20 }) },
      createMockRequestHandlerExtra()
    );

    const parsed = validateToolResponse(GetReferencesDataTypeTool, result) as CursorPaginatedResult;
    expect(parsed.items).toHaveLength(0);
    expect(parsed.nextCursor).toBeFalsy();
  });
});