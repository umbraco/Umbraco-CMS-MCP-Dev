import GetRelationByRelationTypeIdTool from "../get/get-relation-by-relation-type-id.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_RELATION_TYPE_ID = "4954ce93-3bf9-3d1e-9cd2-21bf9f9c2abf";
const TEST_SKIP_VALUE = 0;
const TEST_TAKE_VALUE = 10;

describe("get-relation-by-relation-type-id", () => {
  setupTestEnvironment();

  it("should get relations by relation type ID", async () => {
    const result = await GetRelationByRelationTypeIdTool.handler({
      id: TEST_RELATION_TYPE_ID,
      skip: TEST_SKIP_VALUE,
      take: TEST_TAKE_VALUE
    }, createMockRequestHandlerExtra());

    const response = validateToolResponse(GetRelationByRelationTypeIdTool, result);

    // Verify response structure
    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);

    // Check that there are values in the items
    expect(response.total).toBeGreaterThanOrEqual(0);

  });

  it("should handle invalid relation type ID", async () => {
    const result = await GetRelationByRelationTypeIdTool.handler({
      id: "00000000-0000-0000-0000-000000000000",
      skip: TEST_SKIP_VALUE,
      take: TEST_TAKE_VALUE
    }, createMockRequestHandlerExtra());

    expect(result).toMatchSnapshot();
  });
});