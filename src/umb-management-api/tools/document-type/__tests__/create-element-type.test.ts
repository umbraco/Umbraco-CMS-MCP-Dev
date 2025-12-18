import { normalizeErrorResponse, createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import CreateElementTypeTool from "../post/create-element-type.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import { jest } from "@jest/globals";
import { v4 as uuidv4 } from "uuid";
import { TextString_DATA_TYPE_ID } from "@/constants/constants.js";

const TEST_ELEMENT_NAME = "_Test ElementType Created";
const EXISTING_ELEMENT_NAME = "_Existing ElementType";

describe("create-element-type", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
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
    const result = await CreateElementTypeTool.handler(elementModel, {
      signal: new AbortController().signal,
    });

    // Extract ID for normalization
    const responseData = JSON.parse(result.content[0].text as string);
    const elementTypeId = responseData.id;

    // Verify the handler response using snapshot
    expect(createSnapshotResult(result, elementTypeId)).toMatchSnapshot();

    // Verify the created item exists and matches expected values
    const item = await DocumentTypeTestHelper.findDocumentType(
      TEST_ELEMENT_NAME
    );
    expect(item).toBeDefined();
    expect(DocumentTypeTestHelper.normaliseIds(item!)).toMatchSnapshot();
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
    const rsp = await CreateElementTypeTool.handler(elementModel, {
      signal: new AbortController().signal,
    });

    // Try to create it again
    const result = await CreateElementTypeTool.handler(elementModel, {
      signal: new AbortController().signal,
    });

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

    const result = await CreateElementTypeTool.handler(elementModel, {
      signal: new AbortController().signal,
    });

    // Extract ID for normalization
    const responseData = JSON.parse(result.content[0].text as string);
    const elementTypeId = responseData.id;

    // Verify the handler response using snapshot
    expect(createSnapshotResult(result, elementTypeId)).toMatchSnapshot();

    const item = await DocumentTypeTestHelper.findDocumentType(
      TEST_ELEMENT_NAME
    );
    expect(item).toBeDefined();
    expect(DocumentTypeTestHelper.normaliseIds(item!)).toMatchSnapshot();
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

    const result = await CreateElementTypeTool.handler(elementModel, {
      signal: new AbortController().signal
    });

    // The tool catches validation errors and returns them as error responses
    const errorText = result.content[0].text as string;
    expect(errorText).toContain("Property must specify either 'tab' or 'group'");
    expect(errorText).toContain("Properties without a container are invisible");
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

    const result = await CreateElementTypeTool.handler(elementModel, {
      signal: new AbortController().signal
    });

    const responseData = JSON.parse(result.content[0].text as string);
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
