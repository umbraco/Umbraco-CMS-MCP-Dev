import GetDataTypeConfigurationTool from "../get/get-data-type-configuration.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

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
    // Act - Get the data type configuration
    const result = await GetDataTypeConfigurationTool.handler({}, createMockRequestHandlerExtra());

    // Assert - Verify the handler response
    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Assert - Verify expected properties exist
    const parsed: { canBeChanged: boolean; documentListViewId: string; mediaListViewId: string } =
      result.structuredContent as any;
    expect(parsed).toHaveProperty("canBeChanged");
    expect(parsed).toHaveProperty("documentListViewId");
    expect(parsed).toHaveProperty("mediaListViewId");
  });
});