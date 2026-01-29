import { getTemporaryFileByIdParams } from "@/umb-management-api/temporary-file/types.zod.js";
import GetTemporaryFileTool from "../get/get-temporary-file.js";
import { TemporaryFileBuilder } from "./helpers/temporary-file-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-temporary-file", () => {
  setupTestEnvironment();
  let builder: TemporaryFileBuilder;

  beforeEach(() => {
    builder = new TemporaryFileBuilder();
  });

  afterEach(async () => {
    await builder.cleanup();
  });

  it("should get a temporary file by id", async () => {
    await builder.withExampleFile().create();

    const params = getTemporaryFileByIdParams.parse({ id: builder.getId() });
    const result = await GetTemporaryFileTool.handler(params, createMockRequestHandlerExtra());

    const snapshot = createSnapshotResult(result, builder.getId());
    expect(snapshot).toMatchSnapshot();
  });

  it("should handle non-existent temporary file", async () => {
    const params = getTemporaryFileByIdParams.parse({ id: BLANK_UUID });
    const result = await GetTemporaryFileTool.handler(params, createMockRequestHandlerExtra());
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
