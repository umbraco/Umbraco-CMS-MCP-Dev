import UpdateElementPropertiesTool from "../put/update-element-properties.js";
import { ElementBuilder } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { TextString_DATA_TYPE_ID } from "../../../../constants/constants.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

/**
 * Normalizes the nested element object inside an update-element-properties
 * tool result so that dynamic IDs (element ID and element type ID) are
 * replaced with BLANK_UUID for stable snapshot assertions.
 */
function normalizeUpdateResult(result: any, elementId: string, elementTypeId: string): any {
  const base = createSnapshotResult(result, elementId);
  if (!base.structuredContent?.element) {
    return base;
  }
  const el = base.structuredContent.element;
  return {
    ...base,
    structuredContent: {
      ...base.structuredContent,
      element: {
        ...el,
        id: BLANK_UUID,
        documentType: el.documentType
          ? { ...el.documentType, id: BLANK_UUID }
          : el.documentType,
        variants: el.variants?.map((v: any) => ({
          ...v,
          id: BLANK_UUID,
          createDate: "NORMALIZED_DATE",
          updateDate: "NORMALIZED_DATE",
        })),
      },
    },
  };
}

const TEST_ELEMENT_NAME = "_Test Element Properties";
const TEST_ELEMENT_TYPE_NAME = "_Test Element Type WithProps";
const INITIAL_TITLE = "_Initial Title";
const UPDATED_TITLE = "_Updated Title";
const SUBTITLE_VALUE = "_Subtitle Value";
const INVALID_ALIAS = "nonExistentProperty";

// DocumentTypeBuilder.withProperty has a quirk: it locates existing containers
// by container.id (a UUID) rather than container.name. Calling withProperty
// twice with the same container name therefore creates two separate groups
// that both happen to share the name. Umbraco deduplicates groups by name on
// save, keeping only the last one, so the first property is silently dropped.
// Work around this by giving each property a distinct group name.
const TITLE_CONTAINER = "Title Group";
const SUBTITLE_CONTAINER = "Subtitle Group";

describe("update-element-properties", () => {
  setupTestEnvironment();

  let elementTypeId: string;

  beforeAll(async () => {
    // Create a shared element type with title and subtitle properties,
    // each in a distinct container group to avoid the deduplication issue.
    const builder = await new DocumentTypeBuilder()
      .withName(TEST_ELEMENT_TYPE_NAME)
      .allowAsRoot(true)
      .asElement(true)
      .withProperty("title", "Title", TextString_DATA_TYPE_ID, { container: TITLE_CONTAINER })
      .withProperty("subtitle", "Subtitle", TextString_DATA_TYPE_ID, { container: SUBTITLE_CONTAINER })
      .create();
    elementTypeId = builder.getId();
  });

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await DocumentTypeTestHelper.cleanup(TEST_ELEMENT_TYPE_NAME);
  });

  it("should update a property and preserve other properties", async () => {
    const client = UmbracoManagementClient.getClient();

    // Arrange - create an empty element (values added separately to work
    // around Umbraco 18 not accepting values for freshly-created element types)
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .withDocumentType(elementTypeId)
      .create();
    const elementId = builder.getId();

    // Seed both properties using update-element-properties (add path)
    await UpdateElementPropertiesTool.handler(
      {
        id: elementId,
        properties: [
          { alias: "title", value: INITIAL_TITLE },
          { alias: "subtitle", value: SUBTITLE_VALUE },
        ],
      },
      createMockRequestHandlerExtra()
    );

    // Verify both properties are set before the update under test
    const beforeUpdate = await client.getElementById(elementId);
    expect(beforeUpdate.values.find((v) => v.alias === "title")?.value).toBe(INITIAL_TITLE);
    expect(beforeUpdate.values.find((v) => v.alias === "subtitle")?.value).toBe(SUBTITLE_VALUE);

    // Act - update only the title, leaving subtitle unchanged
    const result = await UpdateElementPropertiesTool.handler(
      {
        id: elementId,
        properties: [
          { alias: "title", value: UPDATED_TITLE },
        ],
      },
      createMockRequestHandlerExtra()
    );

    // Assert - snapshot shows success with updated title and preserved subtitle
    expect(normalizeUpdateResult(result, elementId, elementTypeId)).toMatchSnapshot();

    // Verify title was updated and subtitle was preserved
    const updatedElement = await client.getElementById(elementId);
    expect(updatedElement.values.find((v) => v.alias === "title")?.value).toBe(UPDATED_TITLE);
    expect(updatedElement.values.find((v) => v.alias === "subtitle")?.value).toBe(SUBTITLE_VALUE);
  });

  it("should add a new property not yet set on the element", async () => {
    const client = UmbracoManagementClient.getClient();

    // Arrange - create an empty element and set only the title
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .withDocumentType(elementTypeId)
      .create();
    const elementId = builder.getId();

    // Set only the title first
    await UpdateElementPropertiesTool.handler(
      {
        id: elementId,
        properties: [{ alias: "title", value: INITIAL_TITLE }],
      },
      createMockRequestHandlerExtra()
    );

    // Verify subtitle is NOT set initially
    const initialElement = await client.getElementById(elementId);
    expect(initialElement.values.find((v) => v.alias === "subtitle")).toBeUndefined();

    // Act - add the subtitle property (exists on element type but not yet on element)
    const result = await UpdateElementPropertiesTool.handler(
      {
        id: elementId,
        properties: [{ alias: "subtitle", value: SUBTITLE_VALUE }],
      },
      createMockRequestHandlerExtra()
    );

    // Assert - snapshot shows subtitle was added
    expect(normalizeUpdateResult(result, elementId, elementTypeId)).toMatchSnapshot();

    // Verify subtitle was added and title was preserved
    const updatedElement = await client.getElementById(elementId);
    expect(updatedElement.values.find((v) => v.alias === "subtitle")?.value).toBe(SUBTITLE_VALUE);
    expect(updatedElement.values.find((v) => v.alias === "title")?.value).toBe(INITIAL_TITLE);
  });

  it("should return error for invalid property alias", async () => {
    // Arrange - create an empty element
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .withDocumentType(elementTypeId)
      .create();

    // Act - try to update a property that does not exist on the element type
    const result = await UpdateElementPropertiesTool.handler(
      {
        id: builder.getId(),
        properties: [
          { alias: INVALID_ALIAS, value: "Some Value" },
        ],
      },
      createMockRequestHandlerExtra()
    );

    // Assert - should be an error response with invalid alias details
    expect(result.isError).toBe(true);
    const responseData = result.structuredContent as {
      title: string;
      invalidAliases: string[];
      availableProperties: { alias: string }[];
    };
    expect(responseData.title).toBe("Invalid property aliases");
    expect(responseData.invalidAliases).toContain(INVALID_ALIAS);
    expect(Array.isArray(responseData.availableProperties)).toBe(true);
    expect(responseData.availableProperties.length).toBeGreaterThan(0);
  });
});
