import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "@umbraco-cms/mcp-server-sdk/evals";

const DOCUMENT_TEMPLATE_TOOLS = [
  "get-document-property-value-template",
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
- Get the property value template for the Textbox editor
- Find the document type called 'Article'
- Get the root document of Umbraco
- Find the 'Blogs' document under the root node
- Create a new blog post document under the 'Blogs' document with:
   - Name: "_Test Document With Template"
   - use the document type id of the 'Article' document type
   - user the parent id from the 'Blogs' document
   - Use the textbox template you retrieved for the 'title' property with value "Amazing Test Post"
   - Use the textbox template for the 'subtitle' property with value "Claude AI"
- Delete the new blog document that we just created
- When successfully completed all tasks, say 'The document creation with template workflow has completed successfully', nothing else`,
      tools: DOCUMENT_TEMPLATE_TOOLS,
      requiredTools: ["get-document-property-value-template", "create-document", "delete-document"],
      successPattern: "document creation with template workflow has completed successfully",
      options: { maxTurns: 20 }
    }),
    180000
  );
});
