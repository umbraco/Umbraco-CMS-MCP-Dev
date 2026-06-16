import { ElementTestHelper } from "./element-test-helper.js";
import { ElementBuilder, ElementTypeRegistry } from "./element-builder.js";
import {
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test ElementHelper";
const TEST_RECYCLE_BIN_ELEMENT_NAME = "_Test ElementHelper RecycleBin";

describe("ElementTestHelper", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
    await ElementTestHelper.cleanup(TEST_RECYCLE_BIN_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("getNameFromItem should return the name from the first variant", async () => {
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();
    const item = builder.getCreatedItem();
    expect(ElementTestHelper.getNameFromItem(item)).toBe(TEST_ELEMENT_NAME);
  });

  it("findElement should find an element by variant name", async () => {
    await new ElementBuilder().withName(TEST_ELEMENT_NAME).create();
    const found = await ElementTestHelper.findElement(TEST_ELEMENT_NAME);
    expect(found).toBeDefined();
    expect(ElementTestHelper.getNameFromItem(found!)).toBe(TEST_ELEMENT_NAME);
  });

  it("findElement should return undefined for a non-existent element", async () => {
    const found = await ElementTestHelper.findElement(
      "_NonExistentElementXYZ123"
    );
    expect(found).toBeUndefined();
  });

  it("cleanup should remove an element", async () => {
    await new ElementBuilder().withName(TEST_ELEMENT_NAME).create();

    // Confirm it exists
    let found = await ElementTestHelper.findElement(TEST_ELEMENT_NAME);
    expect(found).toBeDefined();

    // Cleanup
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);

    // Should not be found after cleanup
    found = await ElementTestHelper.findElement(TEST_ELEMENT_NAME);
    expect(found).toBeUndefined();
  });

  it("findElementInRecycleBin should find an element moved to the recycle bin", async () => {
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

  it("findElementInRecycleBin should return undefined for non-existent element", async () => {
    const found = await ElementTestHelper.findElementInRecycleBin(
      "_NonExistentElementRecycleBin"
    );
    expect(found).toBeUndefined();
  });

  it("emptyRecycleBin should remove all elements from the recycle bin", async () => {
    const builder = await new ElementBuilder()
      .withName("_Test ElementHelper EmptyRecycleBin")
      .create();
    await builder.moveToRecycleBin();

    let found = await ElementTestHelper.findElementInRecycleBin(
      "_Test ElementHelper EmptyRecycleBin"
    );
    expect(found).toBeDefined();

    await ElementTestHelper.emptyRecycleBin();

    found = await ElementTestHelper.findElementInRecycleBin(
      "_Test ElementHelper EmptyRecycleBin"
    );
    expect(found).toBeUndefined();
  });
});
