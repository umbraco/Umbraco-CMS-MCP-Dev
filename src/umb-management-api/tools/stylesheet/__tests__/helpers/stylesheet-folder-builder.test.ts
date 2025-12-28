import { StylesheetFolderBuilder } from "./stylesheet-folder-builder.js";
import { StylesheetHelper } from "./stylesheet-helper.js";
import { jest } from "@jest/globals";

const TEST_FOLDER_NAME = "_TestStylesheetFolder";

describe("StylesheetFolderBuilder", () => {
  let originalConsoleError: typeof console.error;
  let builder: StylesheetFolderBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    builder = new StylesheetFolderBuilder();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await StylesheetHelper.cleanup(TEST_FOLDER_NAME);
  });

  it("should build a stylesheet folder model with name", () => {
    const model = builder.withName(TEST_FOLDER_NAME).build();

    expect(model.name).toBe(TEST_FOLDER_NAME);
  });

  it("should throw error when building without name", () => {
    expect(() => {
      builder.build();
    }).toThrow("Name is required for stylesheet folder");
  });

  it("should create a stylesheet folder and return path", async () => {
    await builder.withName(TEST_FOLDER_NAME).create();

    const path = builder.getPath();
    expect(path).toContain(TEST_FOLDER_NAME);

    // Verify it was created
    const exists = await StylesheetHelper.verifyStylesheetFolder(path);
    expect(exists).toBe(true);
  });

  it("should verify created stylesheet folder exists", async () => {
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
    }).toThrow("No stylesheet folder has been created yet");
  });

  it("should throw error when trying to verify before creation", async () => {
    await expect(builder.verify()).rejects.toThrow("No stylesheet folder has been created yet");
  });
});