import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "./helpers/index.js";

const ERROR_HANDLING_TOOLS = [
  // Create operations
  "create-dictionary-item",
  "create-document-type",

  // Update operations
  "update-member",

  // Delete operations
  "delete-data-type-folder",
  "delete-document-type",
  "delete-dictionary-item",

  // Find operations
  "find-dictionary-item",
  "find-data-type",

  // Get operations
  "get-all-document-types"
] as const;

describe("error handling eval tests", () => {
  setupConsoleMock();

  it("should return proper error details for non-existent entity",
    runScenarioTest({
      prompt: `Complete this task:
- Try to update a member with ID "00000000-0000-0000-0000-000000000000" (a non-existent member)
- Use any valid member data for the update, for example:
  - email: "test@example.com"
  - username: "test"
  - password: "TestPass123!@#"
  - isApproved: true
  - variants: [{ "name": "Test" }]
- The update will fail because the member doesn't exist
- When you receive the error, describe what error details you received (mention if you got type, title, status, detail fields)
- Say 'Error handling test completed' when done`,
      tools: ERROR_HANDLING_TOOLS,
      requiredTools: ["update-member"],
      successPattern: "Error handling test completed",
      options: { maxTurns: 5 }
    }),
    120000
  );

  it("should return proper error details for validation failure",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Try to delete a folder with ID "00000000-0000-0000-0000-000000000000" (a non-existent folder)
2. The delete will fail because the folder doesn't exist
3. When you receive the error, describe what error details you received (mention if you got type, title, status, detail fields)
4. Say 'Validation error test completed' when done`,
      tools: ERROR_HANDLING_TOOLS,
      requiredTools: ["delete-data-type-folder"],
      successPattern: "Validation error test completed",
      options: { maxTurns: 10 }
    }),
    120000
  );

  it("should handle multiple error scenarios gracefully",
    runScenarioTest({
      prompt: `Complete these tasks and report on each error:
1. Try to update a member with ID "00000000-0000-0000-0000-000000000000" (non-existent)
2. Try to delete a data type folder with ID "00000000-0000-0000-0000-000000000000" (non-existent)
3. For each error, briefly note that you received an error
4. Say 'Multiple error test completed' when done`,
      tools: ERROR_HANDLING_TOOLS,
      requiredTools: ["update-member", "delete-data-type-folder"],
      successPattern: "Multiple error test completed",
      options: { maxTurns: 8 }
    }),
    120000
  );

  it("should return proper validation error from Zod schema",
    runScenarioTest({
      prompt: `Complete this task to test client-side validation errors:
1. Try to create a document type with an EMPTY alias (which is required)
   - Use name: "_Test Empty Alias"
   - Use alias: "" (empty string - this should fail validation)
   - Set allowedAtRoot: true
   - Use icon: "icon-document"
2. The creation will fail with a Zod validation error
3. When you receive the error, describe the error details you received
   - Mention what fields are present (type, title, status, detail)
   - Check if the detail contains validation information about the alias field
4. Say 'Validation error test completed' when done`,
      tools: ERROR_HANDLING_TOOLS,
      requiredTools: ["create-document-type"],
      successPattern: "Validation error test completed",
      options: { maxTurns: 5 }
    }),
    120000
  );

});
