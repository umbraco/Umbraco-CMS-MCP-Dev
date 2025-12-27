import FindDataTypeTool from "../get/find-data-type.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { getFilterDataTypeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetFilterDataTypeParams } from "@/umb-management-api/schemas/index.js";

const TEST_DATATYPE_NAME = "_Test FindDataType";
const TEST_DATATYPE_NAME_2 = "_Test FindDataType 2";

describe("find-data-type", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME_2);
  });

  it("should find a data type by name", async () => {
    // Arrange - Create a data type
    await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Act - Use the tool to find by name
    const params: GetFilterDataTypeParams = { name: TEST_DATATYPE_NAME, take: 100 };
    const result = await FindDataTypeTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert - Verify the data type was found
    const data = validateStructuredContent(result, getFilterDataTypeResponse);
    expect(data.total).toBeGreaterThan(0);
    const found = data.items.find(
      (dt: any) => dt.name === TEST_DATATYPE_NAME
    );
    expect(found).toBeTruthy();
    expect(found!.name).toBe(TEST_DATATYPE_NAME);
  });

  it("should return no results for a non-existent name", async () => {
    // Act - Search for non-existent data type
    const params: GetFilterDataTypeParams = { name: "nonexistentdatatype_" + Date.now(), take: 100 };
    const result = await FindDataTypeTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert - Verify no results
    const data = validateStructuredContent(result, getFilterDataTypeResponse);
    expect(data.total).toBe(0);
    expect(data.items.length).toBe(0);
  });
});