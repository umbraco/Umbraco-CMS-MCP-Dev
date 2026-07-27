import { ScriptFolderBuilder } from "./script-folder-builder.js";

describe("ScriptFolderBuilder", () => {
  let helper: ScriptFolderBuilder;
  let parentHelper: ScriptFolderBuilder;

  beforeEach(() => {
    helper = new ScriptFolderBuilder();
    parentHelper = new ScriptFolderBuilder();
  });

  afterEach(async () => {
    await helper.cleanup();
    await parentHelper.cleanup();
  });

  it("should create a script folder with name", async () => {
    await helper
      .withName("_TestFolder_" + Date.now())
      .create();

    expect(helper.getPath()).toBeDefined();
    expect(await helper.verify()).toBe(true);
  });

  it("should create a script folder with parent", async () => {
    // First create a parent folder
    await parentHelper
      .withName("_ParentFolder_" + Date.now())
      .create();

    const parentPath = parentHelper.getPath();

    // Then create a child folder
    await helper
      .withName("_ChildFolder_" + Date.now())
      .withParent(parentPath)
      .create();

    expect(helper.getPath()).toBeDefined();
    expect(await helper.verify()).toBe(true);
    expect(await parentHelper.verify()).toBe(true);
  });

  it("should build model without creating", () => {
    const model = helper
      .withName("Build Test Folder")
      .build();

    expect(model.name).toBe("Build Test Folder");
  });

  it("should get created item", async () => {
    await helper
      .withName("_GetItemFolder_" + Date.now())
      .create();

    const item = helper.getItem();
    expect(item).toBeDefined();
    expect(item.name).toMatch(/^_GetItemFolder_\d+$/);
    expect(item.isFolder).toBe(true);
  });
});