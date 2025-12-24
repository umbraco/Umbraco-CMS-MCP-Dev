import { describe } from "@jest/globals";
import {
  TOOL_SETS,
  setupConsoleMock,
  workflowTest
} from "./helpers/index.js";

describe("create-data-type e2e tests", () => {
  setupConsoleMock();

  workflowTest(
    "should create and delete a textbox data type",
    [
      "Create a new data type called '_TestDataType' that is a textBox with 200 max characters",
      "Delete the data type"
    ],
    TOOL_SETS.dataType,
    ["create-data-type", "delete-data-type", "get-data-type-property-editor-template"]
  );
});
