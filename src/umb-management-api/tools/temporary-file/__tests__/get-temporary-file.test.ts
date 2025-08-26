import { getTemporaryFileByIdParams } from "@/umb-management-api/temporary-file/types.zod.js";
import GetTemporaryFileTool from "../get/get-temporary-file.js";
import { TemporaryFileBuilder } from "./helpers/temporary-file-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";

describe("get-temporary-file", () => {
  let originalConsoleError: typeof console.error;
  let builder: TemporaryFileBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    builder = new TemporaryFileBuilder();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await builder.cleanup();
  });

  it("should get a temporary file by id", async () => {
    await builder.withExampleFile().create();

    const params = getTemporaryFileByIdParams.parse({ id: builder.getId() });
    const result = await GetTemporaryFileTool().handler(params, {
      signal: new AbortController().signal,
    });

    const snapshot = createSnapshotResult(result, builder.getId());
    expect(snapshot).toMatchSnapshot();
  });

  it("should handle non-existent temporary file", async () => {
    const params = getTemporaryFileByIdParams.parse({ id: BLANK_UUID });
    const result = await GetTemporaryFileTool().handler(params, {
      signal: new AbortController().signal,
    });
    expect(result).toMatchSnapshot();
  });
});
