import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "@umbraco-cms/mcp-server-sdk/evals";

const DOCUMENT_TEMPLATE_TOOLS = [
  "get-document-type-schema",
  "get-document-root",
  "get-document-children",
  "create-document",
  "delete-document",
  "get-all-document-types"
] as const;

describe("create-document-with-template eval tests", () => {
  setupConsoleMock();

  it("should create document using property value template",
    runScenarioTest({
      prompt: `Complete these tasks in order:
- Get all document types and find the 'Article' document type
- Get the JSON Schema for the Article document type using get-document-type-schema
- Get the root document of Umbraco
- Find the 'Blogs' document under the root node
- Create a new blog post document under the 'Blogs' document with:
   - Name: "_Test Document With Template"
   - use the document type id of the 'Article' document type
   - use the parent id from the 'Blogs' document
   - Use the schema to understand the property structure and set the 'title' property to "Amazing Test Post"
   - Set the 'subtitle' property to "Claude AI"
- Delete the new blog document that we just created
- When successfully completed all tasks, say 'The document creation with template workflow has completed successfully', nothing else`,
      tools: DOCUMENT_TEMPLATE_TOOLS,
      requiredTools: ["get-document-type-schema", "create-document", "delete-document"],
      successPattern: "document creation with template workflow has completed successfully",
      options: { maxTurns: 20 }
    }),
    180000
  );
});
