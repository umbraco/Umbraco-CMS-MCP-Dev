import { describe } from "@jest/globals";
import {
  TOOL_SETS,
  setupConsoleMock,
  createScenarioTest,
  workflowTest
} from "./helpers/index.js";

describe("basic e2e tests", () => {
  setupConsoleMock();

  createScenarioTest({
    name: "should get document type configuration",
    prompt: "Return the document type configuration as a list of properties in json format.",
    tools: TOOL_SETS.basic,
    requiredTools: ["get-document-type-configuration"],
    options: { maxTurns: 5 }
  });

  createScenarioTest({
    name: "should get home document details",
    prompt: "Find and return details of the home page document node. The home page is typically the root document in Umbraco.",
    tools: TOOL_SETS.basic,
    requiredTools: ["get-document-root"],
    options: { maxTurns: 5 }
  });

  workflowTest(
    "should complete data type folder management workflow",
    [
      "Create a new data type folder called 'TestFolder' at the root level",
      "Get the data type root to see available data types",
      "Move the 'textstring' data type into the 'TestFolder'",
      "Move the 'textstring' data type to the root level",
      "Delete the 'TestFolder'"
    ],
    TOOL_SETS.basic,
    ["create-data-type-folder", "get-data-type-root", "move-data-type", "delete-data-type-folder"],
    180000
  );
});
