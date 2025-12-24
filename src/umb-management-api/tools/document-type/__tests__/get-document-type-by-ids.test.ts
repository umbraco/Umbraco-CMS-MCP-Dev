import GetDocumentTypesByIdArrayTool from "../get/get-document-type-by-id-array.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import { getItemDocumentTypeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { jest } from "@jest/globals";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { BLANK_UUID } from "@/constants/constants.js";

describe("get-item-document-type", () => {
  const TEST_DOCTYPE_NAME = "_Test Item DocumentType";
  const TEST_DOCTYPE_NAME_2 = "_Test Item DocumentType2";
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME_2);
  });

  it("should get no document types for empty request", async () => {
    // Get all document types
    const result = await GetDocumentTypesByIdArrayTool.handler(
      {} as any, createMockRequestHandlerExtra()
    );
    const items = validateStructuredContent(result, getItemDocumentTypeResponse);

    expect(items).toMatchSnapshot();
  });

  it("should get single document type by ID", async () => {
    // Create a document type
    const builder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();

    // Get by ID
    const result = await GetDocumentTypesByIdArrayTool.handler(
      { id: [builder.getId()] } as any, createMockRequestHandlerExtra()
    );
    const items = validateStructuredContent(result, getItemDocumentTypeResponse) as any[];
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe(TEST_DOCTYPE_NAME);
    // Normalize for snapshot
    items[0].id = BLANK_UUID;
    expect(items).toMatchSnapshot();
  });

  it("should get multiple document types by ID", async () => {
    // Create first document type
    const builder1 = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();

    // Create second document type
    const builder2 = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME_2)
      .withIcon("icon-document")
      .create();

    // Get by IDs
    const result = await GetDocumentTypesByIdArrayTool.handler(
      {
        id: [builder1.getId(), builder2.getId()],
      } as any, createMockRequestHandlerExtra()
    );

    const items = validateStructuredContent(result, getItemDocumentTypeResponse) as any[];
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe(TEST_DOCTYPE_NAME);
    expect(items[1].name).toBe(TEST_DOCTYPE_NAME_2);

    // Normalize for snapshot
    items.forEach((item: any) => {
      item.id = BLANK_UUID;
    });
    expect(items).toMatchSnapshot();
  });
});
