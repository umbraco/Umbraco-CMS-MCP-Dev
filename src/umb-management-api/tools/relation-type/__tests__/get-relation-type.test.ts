import GetRelationTypeTool from "../get/get-relation-type.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

describe("get-relation-type", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("should get relation types with default pagination", async () => {
    const result = await GetRelationTypeTool().handler({
      skip: 0,
      take: 10
    }, { signal: new AbortController().signal });

    const response = JSON.parse((result.content[0] as any).text);

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