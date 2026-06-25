import { ElementBuilder, ElementTypeRegistry } from "./element-builder.js";
import { ElementTestHelper } from "./element-test-helper.js";
import {
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test ElementBuilder";
const TEST_RECYCLE_BIN_ELEMENT_NAME = "_Test ElementBuilder RecycleBin";

describe("ElementBuilder", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
    await ElementTestHelper.cleanup(TEST_RECYCLE_BIN_ELEMENT_NAME);
  });

  afterAll(async () => {
    // Clean up the shared element type after all tests
    await ElementTypeRegistry.deleteElementType();
  });

  it("should create an element and find it by name", async () => {
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    const found = await ElementTestHelper.findElement(TEST_ELEMENT_NAME);
    expect(found).toBeDefined();
    expect(ElementTestHelper.getNameFromItem(found)).toBe(TEST_ELEMENT_NAME);
  });

  it("should return the created element's id and item", async () => {
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    const id = builder.getId();
    const item = builder.getCreatedItem();
    expect(id).toBeDefined();
    expect(item).toBeDefined();
    expect(ElementTestHelper.getNameFromItem(item)).toBe(TEST_ELEMENT_NAME);
  });

  it("getId should throw if called before create", async () => {
    const builder = new ElementBuilder().withName("_Test Error Builder");
    expect(() => builder.getId()).toThrow(/No element has been created yet/);
  });

  it("getCreatedItem should throw if called before create", async () => {
    const builder = new ElementBuilder().withName("_Test Error Builder");
    expect(() => builder.getCreatedItem()).toThrow(
      /No element has been created yet/
    );
  });

  it("moveToRecycleBin should move a created element to the recycle bin", async () => {
    const builder = await new ElementBuilder()
      .withName(TEST_RECYCLE_BIN_ELEMENT_NAME)
      .create();
    await builder.moveToRecycleBin();

    // Should not be found in normal tree
    const foundNormal = await ElementTestHelper.findElement(
      TEST_RECYCLE_BIN_ELEMENT_NAME
    );
    expect(foundNormal).toBeUndefined();

    // Should be found in recycle bin
    const foundRecycleBin = await ElementTestHelper.findElementInRecycleBin(
      TEST_RECYCLE_BIN_ELEMENT_NAME
    );
    expect(foundRecycleBin).toBeDefined();
    expect(foundRecycleBin!.variants[0].name).toBe(
      TEST_RECYCLE_BIN_ELEMENT_NAME
    );
  });

  it("moveToRecycleBin should throw if called before create", async () => {
    const builder = new ElementBuilder()
      .withName("_Test MoveToRecycleBin Error")
    await expect(builder.moveToRecycleBin()).rejects.toThrow(
      /No element has been created yet/
    );
  });
});
