import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "./helpers/index.js";

const BASIC_TOOLS = [
  "get-document-type-configuration",
  "get-document-root",
  "get-document-by-id",
  "create-data-type-folder",
  "get-data-type-root",
  "find-data-type",
  "move-data-type",
  "delete-data-type-folder"
];

describe("basic eval tests", () => {
  setupConsoleMock();

  it("should get document type configuration",
    runScenarioTest({
      prompt: "Return the document type configuration as a list of properties in json format.",
      tools: BASIC_TOOLS,
      requiredTools: ["get-document-type-configuration"],
      options: { maxTurns: 5 }
    }),
    120000
  );

  it("should get home document details",
    runScenarioTest({
      prompt: "Find and return details of the home page document node. The home page is typically the root document in Umbraco.",
      tools: BASIC_TOOLS,
      requiredTools: ["get-document-root"],
      options: { maxTurns: 5 }
    }),
    120000
  );

  it("should complete data type folder management workflow",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a new data type folder called 'TestFolder' at the root level
2. Get the data type root to see available data types
3. Move the 'textstring' data type into the 'TestFolder'
4. Move the 'textstring' data type to the root level
5. Delete the 'TestFolder'
6. When successfully completed, say 'The task has completed successfully'`,
      tools: BASIC_TOOLS,
      requiredTools: ["create-data-type-folder", "get-data-type-root", "move-data-type", "delete-data-type-folder"],
      successPattern: "task has completed successfully"
    }),
    180000
  );
});
