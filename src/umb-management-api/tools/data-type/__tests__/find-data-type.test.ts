import FindDataTypeTool from "../get/find-data-type.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import { jest } from "@jest/globals";

const TEST_DATATYPE_NAME = "_Test FindDataType";
const TEST_DATATYPE_NAME_2 = "_Test FindDataType 2";

describe("find-data-type", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME_2);
    console.error = originalConsoleError;
  });

  it("should find a data type by name", async () => {
    // Create a data type
    await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Use the tool to find by name
    const result = await FindDataTypeTool.handler(
      { name: TEST_DATATYPE_NAME, take: 100 },
      { signal: new AbortController().signal }
    );

    const data = JSON.parse(result.content[0].text as string);
    expect(data.total).toBeGreaterThan(0);
    const found = data.items.find(
      (dt: any) => dt.name === TEST_DATATYPE_NAME
    );
    expect(found).toBeTruthy();
    expect(found.name).toBe(TEST_DATATYPE_NAME);
  });

  it("should return no results for a non-existent name", async () => {
    const result = await FindDataTypeTool.handler(
      {
        name: "nonexistentdatatype_" + Date.now(),
        take: 100,
      },
      { signal: new AbortController().signal }
    );

    const data = JSON.parse(result.content[0].text as string);
    expect(data.total).toBe(0);
    expect(data.items.length).toBe(0);
  });

});