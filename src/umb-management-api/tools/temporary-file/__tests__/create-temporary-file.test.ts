import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import CreateTemporaryFileTool from "../post/create-temporary-file.js";
import { TemporaryFileTestHelper } from "./helpers/temporary-file-helper.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { readFileSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { EXAMPLE_IMAGE_PATH } from "@/constants/constants.js";

describe("create-temporary-file", () => {
  setupTestEnvironment();
  let testId = "";

  beforeEach(() => {
    testId = uuidv4();
  });

  afterEach(async () => {
    await TemporaryFileTestHelper.cleanup(testId);
  });

  it("should create a temporary file", async () => {
    const fileBuffer = readFileSync(
      join(process.cwd(), EXAMPLE_IMAGE_PATH)
    );
    const fileAsBase64 = fileBuffer.toString('base64');

    const result = await CreateTemporaryFileTool.handler(
      {
        id: testId,
        fileName: "example.jpg",
        fileAsBase64: fileAsBase64,
      },
      createMockRequestHandlerExtra()
    );

    expect(createSnapshotResult(result, testId)).toMatchSnapshot();

    const items = await TemporaryFileTestHelper.findTemporaryFiles(testId);
    // Normalize fileName which contains dynamic UUID (e.g., umbraco-upload-{uuid}-example.jpg)
    const normalizedItems = items.map((item: { fileName?: string }) => ({
      ...item,
      fileName: item.fileName?.replace(/umbraco-upload-[a-f0-9-]+-/, 'umbraco-upload-NORMALIZED-')
    }));
    expect(createSnapshotResult({ structuredContent: { items: normalizedItems } })).toMatchSnapshot();
  });

  it("should handle empty base64", async () => {
    const result = await CreateTemporaryFileTool.handler(
      {
        id: testId,
        fileName: "test.jpg",
        fileAsBase64: "",
      },
      createMockRequestHandlerExtra()
    );

    // Empty base64 creates an empty file, which should succeed
    // The API will accept it even though it's a 0-byte file
    expect(createSnapshotResult(result, testId)).toMatchSnapshot();
  });
});
