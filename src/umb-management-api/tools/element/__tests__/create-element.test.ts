import CreateElementTool from "../post/create-element.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { ElementTypeRegistry } from "./helpers/element-builder.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element Created";

describe("create-element", () => {
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

  it("should create an element", async () => {
    const result = await CreateElementTool.handler(
      {
        documentTypeId: elementTypeId,
        name: TEST_ELEMENT_NAME,
        parentId: undefined,
        cultures: undefined,
        values: [],
      },
      createMockRequestHandlerExtra()
    );

    const responseData = validateToolResponse(CreateElementTool, result);
    const elementId = responseData.id;

    expect(createSnapshotResult(result, elementId)).toMatchSnapshot();

    const item = await ElementTestHelper.findElement(TEST_ELEMENT_NAME);
    expect(item).toBeDefined();
  });

  it("should return error for non-existent document type", async () => {
    const result = await CreateElementTool.handler(
      {
        documentTypeId: "00000000-0000-0000-0000-000000000001",
        name: TEST_ELEMENT_NAME,
        parentId: undefined,
        cultures: undefined,
        values: [],
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
  });
});
