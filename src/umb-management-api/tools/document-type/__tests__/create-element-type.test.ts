import { normalizeErrorResponse, createSnapshotResult , normalizeObject} from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import CreateElementTypeTool, { createElementTypeOutputSchema } from "../post/create-element-type.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { v4 as uuidv4 } from "uuid";
import { TextString_DATA_TYPE_ID } from "@/constants/constants.js";

const TEST_ELEMENT_NAME = "_Test ElementType Created";
const EXISTING_ELEMENT_NAME = "_Existing ElementType";

describe("create-element-type", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test element types
    await DocumentTypeTestHelper.cleanup(TEST_ELEMENT_NAME);
    await DocumentTypeTestHelper.cleanup(EXISTING_ELEMENT_NAME);
  });

  it("should create an element type", async () => {
    const elementModel = {
      name: TEST_ELEMENT_NAME,
      alias: TEST_ELEMENT_NAME.toLowerCase().replace(/\s+/g, ""),
      icon: "icon-document",
      compositions: [],
      properties: [],
    };

    // Create the element type
    const result = await CreateElementTypeTool.handler(elementModel as any, createMockRequestHandlerExtra());

    // Extract ID for normalization
    const responseData = validateStructuredContent(result, createElementTypeOutputSchema);
    const elementTypeId = responseData.id;

    // Verify the handler response using snapshot
    expect(responseData.message).toBe("Element type created successfully");
    expect(createSnapshotResult(result, elementTypeId)).toMatchSnapshot();

    // Verify the created item exists and matches expected values
    const item = await DocumentTypeTestHelper.findDocumentType(
      TEST_ELEMENT_NAME
    );
    expect(item).toBeDefined();
    expect(normalizeObject(item!)).toMatchSnapshot();
  });

  it("should handle existing element type", async () => {
    const elementModel = {
      name: EXISTING_ELEMENT_NAME,
      alias: EXISTING_ELEMENT_NAME.toLowerCase().replace(/\s+/g, ""),
      icon: "icon-document",
      compositions: [],
      properties: [],
    };

    // First create the element type
    const rsp = await CreateElementTypeTool.handler(elementModel as any, createMockRequestHandlerExtra());

    // Try to create it again
    const result = await CreateElementTypeTool.handler(elementModel as any, createMockRequestHandlerExtra());

    // Verify the error response using snapshot
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });

  it("should create an element type with properties", async () => {
    const elementModel = {
      name: TEST_ELEMENT_NAME,
      alias: TEST_ELEMENT_NAME.toLowerCase().replace(/\s+/g, ""),
      icon: "icon-document",
      description: "Test element type with properties",
      compositions: [],
      properties: [
        {
          name: "Test Property",
          alias: "testProperty",
          dataTypeId: TextString_DATA_TYPE_ID,
          tab: "Content",
          group: "General",
        },
      ],
    };

    const result = await CreateElementTypeTool.handler(elementModel as any, createMockRequestHandlerExtra());

    // Extract ID for normalization
    const responseData = validateStructuredContent(result, createElementTypeOutputSchema);
    const elementTypeId = responseData.id;

    // Verify the handler response using snapshot
    expect(responseData.message).toBe("Element type created successfully");
    expect(createSnapshotResult(result, elementTypeId)).toMatchSnapshot();

    const item = await DocumentTypeTestHelper.findDocumentType(
      TEST_ELEMENT_NAME
    );
    expect(item).toBeDefined();
    expect(normalizeObject(item!)).toMatchSnapshot();
  });

  it("should reject property without tab or group", async () => {
    const elementModel = {
      name: TEST_ELEMENT_NAME,
      alias: TEST_ELEMENT_NAME.toLowerCase().replace(/\s+/g, ''),
      icon: "icon-document",
      compositions: [],
      properties: [
        {
          name: "Bad Property",
          alias: "badProperty",
          dataTypeId: TextString_DATA_TYPE_ID,
          // Missing both tab and group
        } as any // Need to bypass TypeScript to test runtime validation
      ]
    };

    // The zod schema validation should fail and return an error result
    const result = await CreateElementTypeTool.handler(elementModel as any, createMockRequestHandlerExtra());
    expect(result.isError).toBe(true);
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });

  it("should create separate groups for same group name in different tabs", async () => {
    const elementModel = {
      name: TEST_ELEMENT_NAME,
      alias: TEST_ELEMENT_NAME.toLowerCase().replace(/\s+/g, ''),
      icon: "icon-document",
      compositions: [],
      properties: [
        {
          name: "Prop1",
          alias: "prop1",
          dataTypeId: TextString_DATA_TYPE_ID,
          tab: "Tab1",
          group: "Settings"
        },
        {
          name: "Prop2",
          alias: "prop2",
          dataTypeId: TextString_DATA_TYPE_ID,
          tab: "Tab2",
          group: "Settings"
        }
      ]
    };

    const result = await CreateElementTypeTool.handler(elementModel as any, createMockRequestHandlerExtra());

    const responseData = validateStructuredContent(result, createElementTypeOutputSchema);
    const fullElementType = await DocumentTypeTestHelper.getFullDocumentType(responseData.id);

    // Should have 2 tabs
    const tabs = fullElementType.containers.filter(c => c.type === "Tab");
    expect(tabs).toHaveLength(2);

    // Should have 2 separate "Settings" groups
    const groups = fullElementType.containers.filter(c => c.type === "Group" && c.name === "Settings");
    expect(groups).toHaveLength(2);

    // Each group should be parented to different tab
    expect(groups[0].parent?.id).not.toBe(groups[1].parent?.id);

    // Properties should reference different groups
    expect(fullElementType.properties[0].container?.id).not.toBe(fullElementType.properties[1].container?.id);

    // Verify with snapshot
    const normalized = DocumentTypeTestHelper.normaliseFullDocumentType(fullElementType);
    expect(normalized).toMatchSnapshot();
  });
});
