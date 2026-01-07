import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "./helpers/index.js";

const DATA_TYPE_TOOLS = [
  "create-data-type",
  "delete-data-type",
  "get-data-type-root",
  "get-data-type-property-editor-template",
  "find-data-type"
];

describe("create-data-type eval tests", () => {
  setupConsoleMock();

  it("should create and delete a textbox data type",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a new data type called '_TestDataType' that is a textBox with 200 max characters
2. Delete the data type
3. When successfully completed, say 'The task has completed successfully'`,
      tools: DATA_TYPE_TOOLS,
      requiredTools: ["create-data-type", "delete-data-type", "get-data-type-property-editor-template"],
      successPattern: "task has completed successfully"
    }),
    120000
  );
});
