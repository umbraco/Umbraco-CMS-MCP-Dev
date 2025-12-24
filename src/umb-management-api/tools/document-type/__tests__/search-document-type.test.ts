import SearchDocumentTypeTool from "../get/search-document-type.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { getItemDocumentTypeSearchResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { jest } from "@jest/globals";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_DOCTYPE_NAME = "_Test DocumentType Search";
const TEST_DOCTYPE_NAME_2 = "_Test DocumentType Search 2";

describe("search-document-type", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    // Clean up any test document types
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME_2);
  });

  it("should search for document types", async () => {
    // Create test document types
    await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();

    await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME_2)
      .withIcon("icon-document")
      .create();

    // Search for document types
    const result = await SearchDocumentTypeTool.handler({
      query: TEST_DOCTYPE_NAME,
      skip: 0,
      take: 10
    } as any, createMockRequestHandlerExtra());

    // Verify structured content is valid
    validateStructuredContent(result, getItemDocumentTypeSearchResponse);

    // Verify the handler response using snapshot
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle empty search results", async () => {
    const result = await SearchDocumentTypeTool.handler({
      query: "NonExistentDocumentType",
      skip: 0,
      take: 10
    } as any, createMockRequestHandlerExtra());

    // Verify structured content is valid
    validateStructuredContent(result, getItemDocumentTypeSearchResponse);

    // Verify the handler response using snapshot
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle pagination", async () => {
    // Create test document types
    await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();

    await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME_2)
      .withIcon("icon-document")
      .create();

    // Search with pagination
    const result = await SearchDocumentTypeTool.handler({
      query: TEST_DOCTYPE_NAME,
      skip: 1,
      take: 1
    } as any, createMockRequestHandlerExtra());

    // Verify structured content is valid
    validateStructuredContent(result, getItemDocumentTypeSearchResponse);

    // Verify the handler response using snapshot
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
