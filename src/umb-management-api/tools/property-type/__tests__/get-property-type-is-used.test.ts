import { getPropertyTypeIsUsedQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import GetPropertyTypeIsUsedTool from "../get/get-property-type-is-used.js";
import {
  createSnapshotResult,
  normalizeErrorResponse,
} from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { PropertyTypeTestHelper } from "./helpers/property-type-test-helper.js";

describe("get-property-type-is-used", () => {
  setupTestEnvironment();

  let headerControlsId: string | null;
  const titlePropertyAlias = "title";

  beforeEach(async () => {
    // Get the headerControls document type ID and title property alias
    headerControlsId = await PropertyTypeTestHelper.getHeaderControlsId();
  });

  it.skip("should check if a property type is used with both parameters", async () => {
    const params = getPropertyTypeIsUsedQueryParams.parse({
      contentTypeId: headerControlsId!,
      propertyAlias: titlePropertyAlias,
    });
    const result = await GetPropertyTypeIsUsedTool.handler(params as any, createMockRequestHandlerExtra());

    // Validate response against tool's output schema
    const data = validateToolResponse(GetPropertyTypeIsUsedTool, result);
    expect(data).toHaveProperty("isUsed");

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle empty parameters", async () => {
    const params = getPropertyTypeIsUsedQueryParams.parse({});
    const result = await GetPropertyTypeIsUsedTool.handler(params as any, createMockRequestHandlerExtra());
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
});
