import GetRelationTypeByIdTool from "../get/get-relation-type-by-id.js";
import GetRelationTypeTool from "../get/get-relation-type.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { getRelationTypeResponse, getRelationTypeByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

describe("get-relation-type-by-id", () => {
  setupTestEnvironment();

  it("should get relation type by ID", async () => {
    // First get available relation types to get a valid ID
    const listResult = await GetRelationTypeTool.handler({
      skip: 0,
      take: 1
    }, createMockRequestHandlerExtra());

    const listResponse = validateStructuredContent(listResult, getRelationTypeResponse);

    // Skip test if no relation types available
    if (listResponse.items.length === 0) {
      console.log("No relation types available, skipping test");
      return;
    }

    const testRelationTypeId = listResponse.items[0].id;

    // Now get the specific relation type
    const result = await GetRelationTypeByIdTool.handler({
      id: testRelationTypeId
    }, createMockRequestHandlerExtra());

    const response = validateStructuredContent(result, getRelationTypeByIdResponse);

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
    }, createMockRequestHandlerExtra());

    expect(result).toMatchSnapshot();
  });
});