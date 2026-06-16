import GetElementByIdTool from "../get/get-element-by-id.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test GetElementById";

describe("get-element-by-id", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should get an element by ID", async () => {
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();
    const id = builder.getId();

    const result = await GetElementByIdTool.handler(
      { id },
      createMockRequestHandlerExtra()
    );

    const element = validateToolResponse(GetElementByIdTool, result);
    expect(element.id).toBe(id);
    expect(element.variants[0].name).toBe(TEST_ELEMENT_NAME);
  });

  it("should return error for non-existent ID", async () => {
    const result = await GetElementByIdTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
  });
});
