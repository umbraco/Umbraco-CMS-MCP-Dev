import GetReferencesDataTypeTool from "../get/get-references-data-type.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_DATATYPE_NAME = "_Test DataType References";
const TEST_DOCUMENT_TYPE_NAME = "_Test DocType For References";

describe("get-references-data-type", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
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

    const result = await GetReferencesDataTypeTool().handler(
      { id: dataTypeBuilder.getId() },
      { signal: new AbortController().signal }
    );

    const normalizedResult = {
      ...result,
      content: result.content.map((content: any) => {
        const parsed = JSON.parse(content.text as string);
        const normalizedParsed = Array.isArray(parsed)
          ? parsed.map((item: any) => ({
              ...item,
              contentType: item.contentType ? { ...item.contentType, id: "BLANK_UUID" } : item.contentType
            }))
          : parsed;
        return {
          ...content,
          text: JSON.stringify(normalizedParsed)
        };
      })
    };

    expect(normalizedResult).toMatchSnapshot();

    // Verify the API response structure
    const parsed = JSON.parse(result.content[0].text as string);
    expect(Array.isArray(parsed)).toBe(true);

    // If there are references, verify structure
    if (parsed.length > 0) {
      const reference = parsed[0];
      expect(reference).toHaveProperty('contentType');
      expect(reference).toHaveProperty('properties');
      expect(Array.isArray(reference.properties)).toBe(true);
    }
  });

  it("should return empty array for unreferenced data type", async () => {
    // Create a data type that won't be referenced
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    const result = await GetReferencesDataTypeTool().handler(
      { id: dataTypeBuilder.getId() },
      { signal: new AbortController().signal }
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify the API response structure
    const parsed = JSON.parse(result.content[0].text as string);
    expect(Array.isArray(parsed)).toBe(true);
    // References might be empty or contain system references
  });

  it("should handle non-existent data type", async () => {
    const result = await GetReferencesDataTypeTool().handler(
      { id: BLANK_UUID },
      { signal: new AbortController().signal }
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});