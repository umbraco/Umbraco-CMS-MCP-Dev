import RunHealthCheckGroupTool from "../post/run-health-check-group.js";
import { HealthTestHelper } from "./helpers/health-test-helper.js";
import { postHealthCheckGroupByNameCheckParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { jest } from "@jest/globals";

const TEST_VALID_GROUP_NAME = "Data Integrity";
const TEST_INVALID_GROUP_NAME = "_NonExistentHealthCheckGroup";

describe("run-health-check-group", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await HealthTestHelper.cleanup();
  });

  it("should validate parameters for valid group name", async () => {
    // Test parameter validation only - verify schema accepts valid input
    const params = { name: TEST_VALID_GROUP_NAME };

    // This test only validates the schema accepts the parameter structure
    // We don't execute the actual health check to avoid system impact
    expect(() => {
      postHealthCheckGroupByNameCheckParams.parse(params);
    }).not.toThrow();
  });

  it("should validate parameters for invalid group name", async () => {
    // Test parameter validation for non-existent group
    const params = { name: TEST_INVALID_GROUP_NAME };

    // Verify schema accepts the parameter structure even for invalid names
    // The actual validation happens at execution time, not parameter validation
    expect(() => {
      postHealthCheckGroupByNameCheckParams.parse(params);
    }).not.toThrow();
  });
});