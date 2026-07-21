import { ScriptBuilder } from "./script-builder.js";
import { ScriptFolderBuilder } from "./script-folder-builder.js";

describe("ScriptBuilder", () => {
  let helper: ScriptBuilder;
  let folderHelper: ScriptFolderBuilder;

  beforeEach(() => {
    helper = new ScriptBuilder();
    folderHelper = new ScriptFolderBuilder();
  });

  afterEach(async () => {
    await helper.cleanup();
    await folderHelper.cleanup();
  });

  it("should create a script with name and content", async () => {
    await helper
      .withName("_TestScript_" + Date.now())
      .withContent("// Test script content\nconsole.log('Hello, World!');")
      .create();

    expect(helper.getPath()).toBeDefined();
    expect(await helper.verify()).toBe(true);
  });

  it("should create a script with parent folder", async () => {
    // First create a parent folder
    await folderHelper
      .withName("_ParentFolder_" + Date.now())
      .create();

    const parentPath = folderHelper.getPath();

    // Then create a script in that folder
    await helper
      .withName("_ChildScript_" + Date.now())
      .withContent("// Child script content")
      .withParent(parentPath)
      .create();

    expect(helper.getPath()).toBeDefined();
    expect(await helper.verify()).toBe(true);
    expect(await folderHelper.verify()).toBe(true);
  });

  it("should build model without creating", () => {
    const model = helper
      .withName("Build Test Script")
      .withContent("// Build test content")
      .build();

    expect(model.name).toBe("Build Test Script.js");
    expect(model.content).toBe("// Build test content");
  });

  it("should get created item", async () => {
    await helper
      .withName("_GetItemScript_" + Date.now())
      .withContent("// Get item test")
      .create();

    const item = helper.getItem();
    expect(item).toBeDefined();
    expect(item.name).toMatch(/^_GetItemScript_\d+\.js$/);
  });

  it("should throw error when trying to get ID before creation", () => {
    expect(() => helper.getPath()).toThrow("No script has been created yet");
  });

  it("should throw error when trying to get item before creation", () => {
    expect(() => helper.getItem()).toThrow("No script has been created yet");
  });

  it("should throw error when trying to verify before creation", async () => {
    await expect(helper.verify()).rejects.toThrow("No script has been created yet");
  });

  it("should throw error when creating without name", async () => {
    await expect(helper.withContent("// Test").create()).rejects.toThrow("Name and content are required");
  });

  it("should throw error when creating without content", async () => {
    await expect(helper.withName("Test").create()).rejects.toThrow("Name and content are required");
  });
});