import { ScriptTestHelper } from "./script-test-helper.js";
import { ScriptBuilder } from "./script-builder.js";
import { ScriptFolderBuilder } from "./script-folder-builder.js";

const TEST_SCRIPT_NAME = "_TestScriptHelper_";
const TEST_SCRIPT_CONTENT = "// Test script content for helper";
const TEST_FOLDER_NAME = "_TestFolderHelper_";

describe("ScriptTestHelper", () => {
  let scriptBuilder: ScriptBuilder;
  let folderBuilder: ScriptFolderBuilder;

  beforeEach(() => {
    scriptBuilder = new ScriptBuilder();
    folderBuilder = new ScriptFolderBuilder();
  });

  afterEach(async () => {
    await scriptBuilder.cleanup();
    await folderBuilder.cleanup();
  });

  describe("findByName", () => {
    it("should find script by name in array", () => {
      const testName = "_TestScript_" + Date.now();
      const items = [
        { name: "Script1", path: "/Script1", isFolder: false },
        { name: testName, path: "/TestScript", isFolder: false },
        { name: "Script3", path: "/Script3", isFolder: false }
      ];

      const found = ScriptTestHelper.findByName(items, testName);
      expect(found).toBeDefined();
      expect(found?.name).toBe(testName);
    });

    it("should return undefined when script not found", () => {
      const items = [
        { name: "Script1", path: "/Script1", isFolder: false },
        { name: "Script2", path: "/Script2", isFolder: false }
      ];

      const found = ScriptTestHelper.findByName(items, "NonExistent");
      expect(found).toBeUndefined();
    });
  });

  describe("normaliseIds", () => {
    it("should normalise paths in array", () => {
      const items = [
        { name: "Script1", path: "/Scripts/12345678-1234-1234-1234-123456789abc/script1.js", isFolder: false },
        { name: "Script2", path: "/Scripts/folder/87654321-4321-4321-4321-cba987654321/script2.js", isFolder: false }
      ];

      const normalised = ScriptTestHelper.normaliseIds(items);
      expect(Array.isArray(normalised)).toBe(true);
      if (Array.isArray(normalised)) {
        expect(normalised[0].path).toContain("00000000-0000-0000-0000-000000000000");
        expect(normalised[1].path).toContain("00000000-0000-0000-0000-000000000000");
      }
    });

    it("should normalise path in single item", () => {
      const item = { 
        name: "Script1", 
        path: "/Scripts/12345678-1234-1234-1234-123456789abc/script1.js", 
        isFolder: false 
      };

      const normalised = ScriptTestHelper.normaliseIds(item);
      expect(Array.isArray(normalised)).toBe(false);
      if (!Array.isArray(normalised)) {
        expect(normalised.path).toContain("00000000-0000-0000-0000-000000000000");
      }
    });
  });

  describe("findScript", () => {
    it("should find an existing script", async () => {
      const scriptName = TEST_SCRIPT_NAME + Date.now();
      await scriptBuilder
        .withName(scriptName)
        .withContent(TEST_SCRIPT_CONTENT)
        .create();

      const found = await ScriptTestHelper.findScript(scriptName + '.js');
      expect(found).toBeDefined();
      expect(found?.name).toBe(scriptName + '.js');
      expect(found?.isFolder).toBe(false);
    });

    it("should find an existing folder", async () => {
      const folderName = TEST_FOLDER_NAME + Date.now();
      await folderBuilder
        .withName(folderName)
        .create();

      const found = await ScriptTestHelper.findScript(folderName);
      expect(found).toBeDefined();
      expect(found?.name).toBe(folderName);
      expect(found?.isFolder).toBe(true);
    });

    it("should return undefined for non-existent script", async () => {
      const found = await ScriptTestHelper.findScript("NonExistentScript");
      expect(found).toBeUndefined();
    });
  });

  describe("cleanup", () => {
    it("should cleanup existing script", async () => {
      const scriptName = TEST_SCRIPT_NAME + Date.now();
      await scriptBuilder
        .withName(scriptName)
        .withContent(TEST_SCRIPT_CONTENT)
        .create();

      // Verify it exists first
      let found = await ScriptTestHelper.findScript(scriptName + '.js');
      expect(found).toBeDefined();

      // Clean it up
      await ScriptTestHelper.cleanup(scriptName + '.js');

      // Verify it no longer exists
      found = await ScriptTestHelper.findScript(scriptName + '.js');
      expect(found).toBeUndefined();

      // Clear builder reference to avoid double cleanup
      scriptBuilder = new ScriptBuilder();
    });

    it("should cleanup existing folder", async () => {
      const folderName = TEST_FOLDER_NAME + Date.now();
      await folderBuilder
        .withName(folderName)
        .create();

      // Verify it exists first
      let found = await ScriptTestHelper.findScript(folderName);
      expect(found).toBeDefined();

      // Clean it up
      await ScriptTestHelper.cleanup(folderName);

      // Verify it no longer exists
      found = await ScriptTestHelper.findScript(folderName);
      expect(found).toBeUndefined();

      // Clear builder reference to avoid double cleanup
      folderBuilder = new ScriptFolderBuilder();
    });

    it("should handle cleanup of non-existent script gracefully", async () => {
      // Should not throw an error
      await expect(ScriptTestHelper.cleanup("NonExistentScript")).resolves.not.toThrow();
    });
  });
});