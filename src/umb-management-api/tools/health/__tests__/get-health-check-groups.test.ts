import GetHealthCheckGroupsTool from "../get/get-health-check-groups.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_SKIP_VALUE = 0;
const TEST_TAKE_VALUE = 10;

describe("get-health-check-groups", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
  });

  it("should get health check groups", async () => {
    const result = await GetHealthCheckGroupsTool.handler({
      skip: TEST_SKIP_VALUE,
      take: TEST_TAKE_VALUE
    }, { signal: new AbortController().signal });

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle invalid parameters", async () => {
    const result = await GetHealthCheckGroupsTool.handler({
      skip: -1,
      take: -1
    }, { signal: new AbortController().signal });

    expect(result).toMatchSnapshot();
  });
});