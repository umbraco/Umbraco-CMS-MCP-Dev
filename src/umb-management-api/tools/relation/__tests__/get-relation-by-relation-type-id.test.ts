import GetRelationByRelationTypeIdTool from "../get/get-relation-by-relation-type-id.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_RELATION_TYPE_ID = "4954ce93-3bf9-3d1e-9cd2-21bf9f9c2abf";
const TEST_SKIP_VALUE = 0;
const TEST_TAKE_VALUE = 10;

describe("get-relation-by-relation-type-id", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("should get relations by relation type ID", async () => {
    const result = await GetRelationByRelationTypeIdTool.handler({
      id: TEST_RELATION_TYPE_ID,
      skip: TEST_SKIP_VALUE,
      take: TEST_TAKE_VALUE
    }, { signal: new AbortController().signal });

    const response = JSON.parse((result.content[0] as any).text);

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
    }, { signal: new AbortController().signal });

    expect(result).toMatchSnapshot();
  });
});