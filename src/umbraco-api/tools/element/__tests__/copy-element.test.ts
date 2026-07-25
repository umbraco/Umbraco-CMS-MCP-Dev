import CopyElementTool from "../post/copy-element.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element Copy";
const TEST_ELEMENT_COPY_NAME = "_Test Element Copy (1)";

describe("copy-element", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
    await ElementTestHelper.cleanup(TEST_ELEMENT_COPY_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should copy an element to root", async () => {
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    const result = await CopyElementTool.handler(
      {
        idToCopy: builder.getId(),
        parentId: undefined,
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBeFalsy();

    const responseData = validateToolResponse(CopyElementTool, result);
    const copiedId = responseData.id;

    expect(createSnapshotResult(result, copiedId)).toMatchSnapshot();

    const copiedElement = await ElementTestHelper.findElement(TEST_ELEMENT_COPY_NAME);
    expect(copiedElement).toBeTruthy();
  });

  it("should handle non-existent element", async () => {
    const result = await CopyElementTool.handler(
      {
        idToCopy: BLANK_UUID,
        parentId: undefined,
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
  });
});
