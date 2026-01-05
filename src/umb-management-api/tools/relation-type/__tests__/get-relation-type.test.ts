import GetRelationTypeTool from "../get/get-relation-type.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-relation-type", () => {
  setupTestEnvironment();

  it("should get relation types with default pagination", async () => {
    const result = await GetRelationTypeTool.handler({
      skip: 0,
      take: 10
    }, createMockRequestHandlerExtra());

    const response = validateToolResponse(GetRelationTypeTool, result);

    // Verify response structure
    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);

    // Should have some relation types
    expect(response.total).toBeGreaterThanOrEqual(0);

    // Use snapshot testing for full response
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

});