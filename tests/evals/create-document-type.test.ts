import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "./helpers/index.js";

const DOCUMENT_TYPE_TOOLS = [
  "create-document-type",
  "delete-document-type",
  "get-document-type-configuration",
  "find-data-type",
  "get-icons",
  "get-all-document-types",
  "get-document-type-root",
  "get-document-type-by-id"
] as const;

describe("create-document-type eval tests", () => {
  setupConsoleMock();

  it("should create and delete a simple document type",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a new document type called '_TestDocumentType' with alias '_testdocumenttype' and icon 'icon-document'. It should be allowed at root
2. Delete the document type
3. When successfully completed, say 'The task has completed successfully'`,
      tools: DOCUMENT_TYPE_TOOLS,
      requiredTools: ["create-document-type", "delete-document-type"],
      successPattern: "task has completed successfully"
    }),
    120000
  );

  it("should create document type with properties",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a new document type called '_TestDocumentType', it should have a textstring property called title (group :) and a richtext property called content.
2. Delete the document type called '_TestDocumentType'
3. When successfully completed the tasks, say 'The task has completed successfully', nothing else`,
      tools: DOCUMENT_TYPE_TOOLS,
      requiredTools: ["find-data-type", "create-document-type", "delete-document-type"],
      successPattern: "task has completed successfully",
      options: { maxTurns: 10 }
    }),
    120000
  );
});
