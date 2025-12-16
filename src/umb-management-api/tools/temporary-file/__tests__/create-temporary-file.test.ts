import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import CreateTemporaryFileTool from "../post/create-temporary-file.js";
import { TemporaryFileTestHelper } from "./helpers/temporary-file-helper.js";
import { jest } from "@jest/globals";
import { readFileSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { EXAMPLE_IMAGE_PATH } from "@/constants/constants.js";

describe("create-temporary-file", () => {
  let originalConsoleError: typeof console.error;
  let testId = "";

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    testId = uuidv4();
  });

  afterEach(async () => {
    await TemporaryFileTestHelper.cleanup(testId);
    console.error = originalConsoleError;
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
      { signal: new AbortController().signal }
    );

    expect(createSnapshotResult(result, testId)).toMatchSnapshot();

    const items = await TemporaryFileTestHelper.findTemporaryFiles(testId);
    items[0].id = "NORMALIZED_ID";
    items[0].availableUntil = "NORMALIZED_DATE";
    items[0].fileName = "example.jpg"; // Normalize the UUID prefix from temp file
    expect(items).toMatchSnapshot();
  });

  it("should handle empty base64", async () => {
    const result = await CreateTemporaryFileTool.handler(
      {
        id: testId,
        fileName: "test.jpg",
        fileAsBase64: "",
      },
      { signal: new AbortController().signal }
    );

    // Empty base64 creates an empty file, which should succeed
    // The API will accept it even though it's a 0-byte file
    expect(createSnapshotResult(result, testId)).toMatchSnapshot();
  });
});
