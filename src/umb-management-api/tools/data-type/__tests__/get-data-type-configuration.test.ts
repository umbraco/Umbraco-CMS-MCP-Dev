import GetDataTypeConfigurationTool from "../get/get-data-type-configuration.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

describe("get-data-type-configuration", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("should get the data type configuration", async () => {
    // Act
    const result = await GetDataTypeConfigurationTool().handler({}, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify expected properties exist
    const parsed = JSON.parse(result.content[0].text as string);
    expect(parsed).toHaveProperty("canBeChanged");
    expect(parsed).toHaveProperty("documentListViewId");
    expect(parsed).toHaveProperty("mediaListViewId");
  });
});