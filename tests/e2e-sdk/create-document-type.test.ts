import { describe } from "@jest/globals";
import { setupConsoleMock, createScenarioTest } from "./helpers/index.js";

const DOCUMENT_TYPE_TOOLS = [
  "create-document-type",
  "delete-document-type",
  "get-document-type-configuration"
];

describe("create-document-type e2e tests", () => {
  setupConsoleMock();

  createScenarioTest({
    name: "should create and delete a simple document type",
    prompt: `Complete these tasks in order:
1. Create a new document type called '_TestDocumentType' with alias '_testdocumenttype' and icon 'icon-document'. It should be allowed at root
2. Delete the document type
3. When successfully completed, say 'The task has completed successfully'`,
    tools: DOCUMENT_TYPE_TOOLS,
    requiredTools: ["create-document-type", "delete-document-type"],
    successPattern: "task has completed successfully"
  });
});
