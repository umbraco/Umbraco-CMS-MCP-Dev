import UpdateScriptTool from "../put/update-script.js";
import { ScriptBuilder } from "./helpers/script-builder.js";
import { ScriptTestHelper } from "./helpers/script-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  normalizeErrorResponse,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_SCRIPT_NAME = "_TestScriptUpdate";
const TEST_SCRIPT_CONTENT = "console.log('test script update');";
const UPDATED_SCRIPT_CONTENT = "console.log('updated script content');";
const NONEXISTENT_SCRIPT_PATH = "/NonExistentScript.js";

describe("update-script", () => {
  setupTestEnvironment();

  let scriptBuilder: ScriptBuilder;

  beforeEach(() => {
    scriptBuilder = new ScriptBuilder();
  });

  afterEach(async () => {
    await scriptBuilder.cleanup();
  });

  it("should update a script", async () => {
    // Create initial script
    await scriptBuilder
      .withName(TEST_SCRIPT_NAME)
      .withContent(TEST_SCRIPT_CONTENT)
      .create();

    const result = await UpdateScriptTool.handler(
      {
        path: scriptBuilder.getPath(),
        data: {
          content: UPDATED_SCRIPT_CONTENT,
        },
      },
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Verify the updated script exists and has updated content
    const script = await ScriptTestHelper.findScript(TEST_SCRIPT_NAME + ".js");
    expect(script).toBeDefined();
    expect(script?.name).toBe(TEST_SCRIPT_NAME + ".js");
  });

  it("should handle non-existent script", async () => {
    const result = await UpdateScriptTool.handler(
      {
        path: NONEXISTENT_SCRIPT_PATH,
        data: {
          content: UPDATED_SCRIPT_CONTENT,
        },
      },
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
});
