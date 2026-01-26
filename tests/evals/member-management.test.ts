import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "@umbraco-cms/mcp-server-sdk/evals";

const MEMBER_MANAGEMENT_TOOLS = [
  // Member Type info
  "get-member-type",
  "search-member-type-items",
  // Member CRUD
  "create-member",
  "get-member",
  "find-member",
  "update-member",
  "validate-member",
  // References
  "get-member-are-referenced",
  "get-member-by-id-referenced-by",
  // Cleanup
  "delete-member"
] as const;

describe("member management eval tests", () => {
  setupConsoleMock();

  it("should create, update, and manage member lifecycle",
    runScenarioTest({
      prompt: `Complete these tasks in order using a unique identifier for this test run:
- Generate a unique test identifier using current timestamp (e.g., Date.now()) to make email and username unique
- Search for member types using search-member-type-items with query "Member" to find the default member type
- Create a new member using the member type ID from the search result:
  - email: "test.eval.{timestamp}@example.com" (replace {timestamp} with unique identifier)
  - username: "test_eval_{timestamp}" (replace {timestamp} with unique identifier)
  - password: "TestPass123!@#" (must be at least 10 characters with number and symbol)
  - memberType: { "id": "<use the ID from search result>" }
  - isApproved: true
  - variants: [{ "name": "_Test Member Eval {timestamp}", "culture": null, "segment": null }]
  - values: [] (empty array - no additional values needed for default member type)
- Find the newly created member by searching with find-member using the username you created
- Get the full member details using get-member with the member ID from the find result
- Update the member using update-member to change the name in variants to "_Test Member Eval Updated"
- Validate the updated member data using validate-member with the member ID
- Check if the member is referenced anywhere using get-member-are-referenced with the member ID
- Delete the member using delete-member with the member ID
- Try to find the member again using find-member to verify deletion (this should return no results)
- When all tasks complete, say 'The member management workflow has completed successfully'`,
      tools: MEMBER_MANAGEMENT_TOOLS,
      requiredTools: [
        "create-member",
        "find-member",
        "get-member",
        "update-member",
        "validate-member",
        "delete-member"
      ],
      successPattern: "member management workflow has completed successfully",
      options: { maxTurns: 20 },
    }),
    180000
  );
});
