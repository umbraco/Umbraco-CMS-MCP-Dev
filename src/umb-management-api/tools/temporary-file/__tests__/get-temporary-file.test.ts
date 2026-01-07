import { getTemporaryFileByIdParams } from "@/umb-management-api/temporary-file/types.zod.js";
import GetTemporaryFileTool from "../get/get-temporary-file.js";
import { TemporaryFileBuilder } from "./helpers/temporary-file-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { BLANK_UUID } from "@/constants/constants.js";

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
