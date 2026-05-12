import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "@umbraco-cms/mcp-server-sdk/evals";
import "./helpers/e2e-setup.js";

const DATA_TYPE_TOOLS = [
  "create-data-type",
  "delete-data-type",
  "get-data-type-root",
  "get-data-type-schema",
  "find-data-type"
];

describe("create-data-type eval tests", () => {
  setupConsoleMock();

  it("should create and delete a textbox data type",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Find an existing Textstring data type using find-data-type
2. Get the JSON Schema for that data type using get-data-type-schema to understand its configuration
3. Create a new data type called '_TestDataType' that is a textBox with 200 max characters, using the schema as reference
4. Delete the data type
5. When successfully completed, say 'The task has completed successfully'`,
      tools: DATA_TYPE_TOOLS,
      requiredTools: ["create-data-type", "delete-data-type", "get-data-type-schema"],
      successPattern: "task has completed successfully"
    }),
    120000
  );
});
