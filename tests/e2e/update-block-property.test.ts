import { describe } from "@jest/globals";
import { setupConsoleMock, createScenarioTest } from "./helpers/index.js";

const BLOCK_PROPERTY_TOOLS = [
  "get-document-root",
  "get-document-children",
  "get-document-by-id",
  "update-block-property"
] as const;

describe("update-block-property e2e tests", () => {
  setupConsoleMock();

  createScenarioTest({
    name: "should update block property",
    prompt: `Complete these tasks in order:
- Get the root document of Umbraco
- Find the 'Blogs' document under the root node
- Find an existing blog post document under 'Blogs'
- Look at the 'mainContent' property which contains a BlockList
- Find a block in the contentData and note its contentKey
- Update the 'title' property within that block to "_Block Updated by MCP"
- Read the document back to verify the block was updated
- Restore the original block property value
- When done, say 'The update block property workflow has completed successfully'`,
    tools: BLOCK_PROPERTY_TOOLS,
    requiredTools: ["update-block-property", "get-document-by-id"],
    successPattern: "update block property workflow has completed successfully",
    options: { maxTurns: 15 }
  }, 180000);
});
