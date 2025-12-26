import { describe } from "@jest/globals";
import { setupConsoleMock, createScenarioTest } from "./helpers/index.js";

const DOCUMENT_PROPERTIES_TOOLS = [
  "get-document-root",
  "get-document-children",
  "get-document-by-id",
  "update-document-properties"
] as const;

describe("update-document-properties e2e tests", () => {
  setupConsoleMock();

  createScenarioTest({
    name: "should update document property",
    prompt: `Complete these tasks in order:
- Get the root document of Umbraco
- Find the 'Blogs' document under the root node
- Find an existing blog post document under 'Blogs'
- Note the current 'title' property value
- Update the 'title' property to "_Updated by MCP Test"
- Read the document back to verify the change
- Restore the original title value
- When done, say 'The update document properties workflow has completed successfully'`,
    tools: DOCUMENT_PROPERTIES_TOOLS,
    requiredTools: ["update-document-properties", "get-document-by-id"],
    successPattern: "update document properties workflow has completed successfully",
    options: { maxTurns: 15 }
  }, 180000);
});
