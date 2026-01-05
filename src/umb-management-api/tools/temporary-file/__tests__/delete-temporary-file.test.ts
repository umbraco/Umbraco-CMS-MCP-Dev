import DeleteTemporaryFileTool from "../delete/delete-temporary-file.js";
import { TemporaryFileBuilder } from "./helpers/temporary-file-builder.js";
import { TemporaryFileTestHelper } from "./helpers/temporary-file-helper.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

describe("delete-temporary-file", () => {
  setupTestEnvironment();
  const builder = new TemporaryFileBuilder();

  it("should delete a temporary file", async () => {
    await builder.withExampleFile().create();

    const result = await DeleteTemporaryFileTool.handler(
      {
        id: builder.getId(),
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
    const items = await TemporaryFileTestHelper.findTemporaryFiles(
      builder.getId()
    );
    expect(items).toHaveLength(0);
  });

  it("should handle non-existent temporary file", async () => {
    const result = await DeleteTemporaryFileTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
