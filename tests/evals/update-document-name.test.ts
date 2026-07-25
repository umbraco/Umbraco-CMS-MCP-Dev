import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "@umbraco-cms/mcp-server-sdk/evals";
import "./helpers/e2e-setup.js";

const DOCUMENT_NAME_TOOLS = [
  "get-document-root",
  "get-document-children",
  "get-document-by-id",
  "update-document-name",
  "update-document-properties"
] as const;

describe("update-document-name eval tests", () => {
  setupConsoleMock();

  it("should rename a document without touching its properties or template",
    runScenarioTest({
      prompt: `Complete these tasks in order:
- Get the root document of Umbraco
- Find the 'Blogs' document under the root node
- Find an existing blog post document under 'Blogs'
- Note the current document name, the 'title' property value, and the template
- Rename the document to "_Renamed by MCP Test" using the most surgical tool available for a pure rename
- Read the document back to verify the name changed but the 'title' property and template are unchanged
- Restore the original document name
- When done, say 'The update document name workflow has completed successfully'`,
      tools: DOCUMENT_NAME_TOOLS,
      requiredTools: ["update-document-name", "get-document-by-id"],
      successPattern: "update document name workflow has completed successfully",
      options: { maxTurns: 15 }
    }),
    180000
  );
});
