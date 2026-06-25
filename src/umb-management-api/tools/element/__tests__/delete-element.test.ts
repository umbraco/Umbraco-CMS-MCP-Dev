import DeleteElementTool from "../delete/delete-element.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element Delete";

describe("delete-element", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should delete an element", async () => {
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    const result = await DeleteElementTool.handler(
      { id: builder.getId() },
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();

    const found = await ElementTestHelper.findElement(TEST_ELEMENT_NAME);
    expect(found).toBeUndefined();
  });

  it("should handle non-existent element", async () => {
    const result = await DeleteElementTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });
});
