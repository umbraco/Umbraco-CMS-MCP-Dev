import GetHealthCheckGroupByNameTool from "../get/get-health-check-group-by-name.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_INVALID_GROUP_NAME = "_NonExistentHealthCheckGroup";
const TEST_EMPTY_GROUP_NAME = "";
const TEST_VALID_GROUP_NAME = "Data Integrity";

describe("get-health-check-group-by-name", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
  });

  it("should get health check group by valid name", async () => {
    const result = await GetHealthCheckGroupByNameTool().handler({
      name: TEST_VALID_GROUP_NAME
    }, { signal: new AbortController().signal });

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle non-existent health check group", async () => {
    const result = await GetHealthCheckGroupByNameTool().handler({
      name: TEST_INVALID_GROUP_NAME
    }, { signal: new AbortController().signal });

    expect(result).toMatchSnapshot();
  });

  it("should handle empty group name", async () => {
    const result = await GetHealthCheckGroupByNameTool().handler({
      name: TEST_EMPTY_GROUP_NAME
    }, { signal: new AbortController().signal });

    expect(result).toMatchSnapshot();
  });
});