import { PartialViewFolderBuilder } from "./partial-view-folder-builder.js";
import { PartialViewHelper } from "./partial-view-helper.js";
import { jest } from "@jest/globals";

const TEST_FOLDER_NAME = "_TestPartialViewFolder";

describe("PartialViewFolderBuilder", () => {
  let originalConsoleError: typeof console.error;
  let builder: PartialViewFolderBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    builder = new PartialViewFolderBuilder();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await PartialViewHelper.cleanup(TEST_FOLDER_NAME);
  });

  it("should build a partial view folder model with name", () => {
    const model = builder.withName(TEST_FOLDER_NAME).build();

    expect(model.name).toBe(TEST_FOLDER_NAME);
  });

  it("should throw error when building without name", () => {
    expect(() => {
      builder.build();
    }).toThrow("Name is required for partial view folder");
  });

  it("should create a partial view folder and return path", async () => {
    await builder.withName(TEST_FOLDER_NAME).create();

    const path = builder.getPath();
    expect(path).toContain(TEST_FOLDER_NAME);

    // Verify it was created
    const exists = await PartialViewHelper.verifyPartialViewFolder(path);
    expect(exists).toBe(true);
  });

  it("should verify created partial view folder exists", async () => {
    await builder.withName(TEST_FOLDER_NAME).create();

    const isVerified = await builder.verify();
    expect(isVerified).toBe(true);
  });

  it("should get created item details", async () => {
    await builder.withName(TEST_FOLDER_NAME).create();

    const item = builder.getItem();
    expect(item.path).toContain(TEST_FOLDER_NAME);
  });

  it("should throw error when trying to get path before creation", () => {
    expect(() => {
      builder.getPath();
    }).toThrow("No partial view folder has been created yet");
  });

  it("should throw error when trying to verify before creation", async () => {
    await expect(builder.verify()).rejects.toThrow("No partial view folder has been created yet");
  });
});