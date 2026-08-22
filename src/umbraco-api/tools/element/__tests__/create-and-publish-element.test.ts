import CreateAndPublishElementTool from "../post/create-and-publish-element.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { ElementTypeRegistry } from "./helpers/element-builder.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test CreateAndPublishElement";

describe("create-and-publish-element", () => {
  setupTestEnvironment();

  let elementTypeId: string;

  beforeAll(async () => {
    elementTypeId = await ElementTypeRegistry.getOrCreateElementTypeId();
  });

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should create and publish an invariant element using the default culturesToPublish", async () => {
    // Arrange: invariant element type, culturesToPublish omitted entirely.
    // Umbraco only accepts real culture codes for culturesToPublish (wildcards/nulls are
    // rejected), so for invariant content the tool must default to an empty array to
    // publish the single invariant variant.
    const elementModel = {
      documentTypeId: elementTypeId,
      name: TEST_ELEMENT_NAME,
      parentId: undefined,
      cultures: undefined,
      culturesToPublish: undefined,
      values: [],
    };

    // Act
    const result = await CreateAndPublishElementTool.handler(elementModel, createMockRequestHandlerExtra());

    // Assert
    const responseData = validateToolResponse(CreateAndPublishElementTool, result);
    const elementId = responseData.id;
    expect(createSnapshotResult(result, elementId)).toMatchSnapshot();

    const item = await ElementTestHelper.findElement(TEST_ELEMENT_NAME);
    expect(item).toBeDefined();
    expect(item!.id).toBe(elementId);

    const isPublished = item!.variants.some((v) => v.state === "Published");
    expect(isPublished).toBe(true);
  });

  it("should return error for non-existent document type", async () => {
    const result = await CreateAndPublishElementTool.handler(
      {
        documentTypeId: "00000000-0000-0000-0000-000000000001",
        name: TEST_ELEMENT_NAME,
        parentId: undefined,
        cultures: undefined,
        culturesToPublish: undefined,
        values: [],
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
  });
});
