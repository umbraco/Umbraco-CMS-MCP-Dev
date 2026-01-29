import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "@umbraco-cms/mcp-server-sdk/evals";

const DOCUMENT_COPY_TOOLS = [
  "get-document-root",
  "get-document-children",
  "get-document-by-id",
  "copy-document",
  "publish-document",
  "delete-document",
  "update-document"
] as const;

describe("create-document-copy eval tests", () => {
  setupConsoleMock();

  it("should create and manage blog post copy workflow",
    runScenarioTest({
      prompt: `Complete these tasks in order:
- Get the root document of Umbraco
- Find the 'Blogs' document under the root node (use get-document-children)
- Get the children of the 'Blogs' document to find an existing blog post
- Copy the first blog post you find, keeping it under the same 'Blogs' parent
- Get the newly copied document by its id to see its current properties
- Update the copied document with these property values:
  - title: "_Test Blog Post - Creating Amazing Content"
  - subtitle: "Paul Seal"
  - author: "Paul Seal"
  - articleDate: "2025-01-15"
- Publish the copied document
- Delete the copied document
- When successfully completed all tasks, say 'The blog post workflow has completed successfully', nothing else`,
      tools: DOCUMENT_COPY_TOOLS,
      requiredTools: ["copy-document", "get-document-by-id", "update-document", "publish-document", "delete-document"],
      successPattern: "blog post workflow has completed successfully",
      options: { maxTurns: 20 }
    }),
    180000
  );
});
