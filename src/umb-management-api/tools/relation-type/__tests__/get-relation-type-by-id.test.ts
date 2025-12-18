import GetRelationTypeByIdTool from "../get/get-relation-type-by-id.js";
import GetRelationTypeTool from "../get/get-relation-type.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

describe("get-relation-type-by-id", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("should get relation type by ID", async () => {
    // First get available relation types to get a valid ID
    const listResult = await GetRelationTypeTool.handler({
      skip: 0,
      take: 1
    }, { signal: new AbortController().signal });

    const listResponse = JSON.parse((listResult.content[0] as any).text);

    // Skip test if no relation types available
    if (listResponse.items.length === 0) {
      console.log("No relation types available, skipping test");
      return;
    }

    const testRelationTypeId = listResponse.items[0].id;

    // Now get the specific relation type
    const result = await GetRelationTypeByIdTool.handler({
      id: testRelationTypeId
    }, { signal: new AbortController().signal });

    const response = JSON.parse((result.content[0] as any).text);

    // Verify response structure
    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('name');
    expect(response).toHaveProperty('alias');
    expect(response.id).toBe(testRelationTypeId);

    // Use snapshot testing for full response
    expect(createSnapshotResult(result, testRelationTypeId)).toMatchSnapshot();
  });

  it("should handle invalid relation type ID", async () => {
    const result = await GetRelationTypeByIdTool.handler({
      id: "00000000-0000-0000-0000-000000000000"
    }, { signal: new AbortController().signal });

    expect(result).toMatchSnapshot();
  });
});