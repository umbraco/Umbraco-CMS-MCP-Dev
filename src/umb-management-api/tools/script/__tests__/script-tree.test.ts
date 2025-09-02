import GetScriptTreeRootTool from "../get/get-script-tree-root.js";
import GetScriptTreeChildrenTool from "../get/get-script-tree-children.js";
import GetScriptTreeAncestorsTool from "../get/get-script-tree-ancestors.js";
import { ScriptBuilder } from "./helpers/script-builder.js";
import { ScriptFolderBuilder } from "./helpers/script-folder-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const ROOT_FOLDER_NAME = "_RootFolder";
const ROOT_SCRIPT_NAME = "_RootScript";
const ROOT_SCRIPT_CONTENT = "console.log('root script');";
const CHILD_FOLDER_NAME = "_ChildFolder";
const CHILD_SCRIPT_NAME = "_ChildScript";
const CHILD_SCRIPT_CONTENT = "console.log('child script');";
const GRANDCHILD_SCRIPT_NAME = "_GrandchildScript";
const GRANDCHILD_SCRIPT_CONTENT = "console.log('grandchild script');";

describe("script-tree", () => {
  let originalConsoleError: typeof console.error;
  let rootFolderBuilder: ScriptFolderBuilder;
  let rootScriptBuilder: ScriptBuilder;
  let childFolderBuilder: ScriptFolderBuilder;
  let childScriptBuilder: ScriptBuilder;
  let grandchildScriptBuilder: ScriptBuilder;

  beforeAll(async () => {
    // Create the script tree structure
    rootFolderBuilder = new ScriptFolderBuilder();
    rootScriptBuilder = new ScriptBuilder();
    childFolderBuilder = new ScriptFolderBuilder();
    childScriptBuilder = new ScriptBuilder();
    grandchildScriptBuilder = new ScriptBuilder();

    // Create root folder
    await rootFolderBuilder
      .withName(ROOT_FOLDER_NAME)
      .create();

    // Create root script
    await rootScriptBuilder
      .withName(ROOT_SCRIPT_NAME)
      .withContent(ROOT_SCRIPT_CONTENT)
      .create();

    // Create child folder under root folder
    await childFolderBuilder
      .withName(CHILD_FOLDER_NAME)
      .withParent(rootFolderBuilder.getPath())
      .create();

    // Create child script under root folder
    await childScriptBuilder
      .withName(CHILD_SCRIPT_NAME)
      .withContent(CHILD_SCRIPT_CONTENT)
      .withParent(rootFolderBuilder.getPath())
      .create();

    // Create grandchild script under child folder
    await grandchildScriptBuilder
      .withName(GRANDCHILD_SCRIPT_NAME)
      .withContent(GRANDCHILD_SCRIPT_CONTENT)
      .withParent(childFolderBuilder.getPath())
      .create();
  });

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  afterAll(async () => {
    // Clean up all test script items in reverse order
    await grandchildScriptBuilder.cleanup();
    await childScriptBuilder.cleanup();
    await childFolderBuilder.cleanup();
    await rootScriptBuilder.cleanup();
    await rootFolderBuilder.cleanup();
  });

  describe("get-script-tree-root", () => {
    it("should get root level script items", async () => {
      const result = await GetScriptTreeRootTool().handler(
        {
          take: 100,
        },
        { signal: new AbortController().signal }
      );
      expect(createSnapshotResult(result)).toMatchSnapshot();
    });
  });

  describe("get-script-tree-children", () => {
    it("should get children of root folder", async () => {
      const result = await GetScriptTreeChildrenTool().handler(
        {
          parentPath: rootFolderBuilder.getPath(),
          take: 100,
        },
        { signal: new AbortController().signal }
      );
      expect(createSnapshotResult(result)).toMatchSnapshot();
    });

    it("should get children of child folder", async () => {
      const result = await GetScriptTreeChildrenTool().handler(
        {
          parentPath: childFolderBuilder.getPath(),
          take: 100,
        },
        { signal: new AbortController().signal }
      );
      expect(createSnapshotResult(result)).toMatchSnapshot();
    });

    it("should get empty children for non-folder script", async () => {
      const result = await GetScriptTreeChildrenTool().handler(
        {
          parentPath: grandchildScriptBuilder.getPath(),
          take: 100,
        },
        { signal: new AbortController().signal }
      );
      expect(createSnapshotResult(result)).toMatchSnapshot();
    });
  });

  describe("get-script-tree-ancestors", () => {
    it("should get ancestors of grandchild script", async () => {
      const result = await GetScriptTreeAncestorsTool().handler(
        {
          descendantPath: grandchildScriptBuilder.getPath(),
        },
        { signal: new AbortController().signal }
      );
      expect(createSnapshotResult(result)).toMatchSnapshot();
    });

    it("should get ancestors of child script", async () => {
      const result = await GetScriptTreeAncestorsTool().handler(
        {
          descendantPath: childScriptBuilder.getPath(),
        },
        { signal: new AbortController().signal }
      );
      expect(createSnapshotResult(result)).toMatchSnapshot();
    });

    it("should get empty ancestors for root script", async () => {
      const result = await GetScriptTreeAncestorsTool().handler(
        {
          descendantPath: rootScriptBuilder.getPath(),
        },
        { signal: new AbortController().signal }
      );
      expect(createSnapshotResult(result)).toMatchSnapshot();
    });
  });
});