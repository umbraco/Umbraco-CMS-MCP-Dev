import { describe } from "@jest/globals";
import {
  TOOL_SETS,
  setupConsoleMock,
  workflowTest
} from "./helpers/index.js";

describe("create-document-type e2e tests", () => {
  setupConsoleMock();

  workflowTest(
    "should create and delete a simple document type",
    [
      "Create a new document type called '_TestDocumentType' with alias '_testdocumenttype' and icon 'icon-document'. It should be allowed at root",
      "Delete the document type"
    ],
    TOOL_SETS.documentType,
    ["create-document-type", "delete-document-type"]
  );
});
