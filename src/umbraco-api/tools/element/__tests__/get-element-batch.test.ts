import GetElementBatchTool from "../get/get-element-batch.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME_1 = "_Test GetElementBatch 1";
const TEST_ELEMENT_NAME_2 = "_Test GetElementBatch 2";

describe("get-element-batch", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME_1);
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME_2);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should get multiple elements by id", async () => {
    const first = await new ElementBuilder().withName(TEST_ELEMENT_NAME_1).create();
    const second = await new ElementBuilder().withName(TEST_ELEMENT_NAME_2).create();

    const result = await GetElementBatchTool.handler(
      { id: [first.getId(), second.getId()] },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetElementBatchTool, result) as {
      total: number;
      items: { id: string }[];
    };
    expect(data.items.map((i) => i.id)).toEqual([first.getId(), second.getId()]);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return no items for an unknown id", async () => {
    const result = await GetElementBatchTool.handler(
      { id: [BLANK_UUID] },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetElementBatchTool, result) as { items: unknown[] };
    expect(data.items).toHaveLength(0);
  });
});
