import GetMemberTool from "./get/get-member.js";
import CreateMemberTool from "./post/create-member.js";
import ValidateMemberTool from "./post/validate-member.js";
import DeleteMemberTool from "./delete/delete-member.js";
import UpdateMemberTool from "./put/update-member.js";
import ValidateMemberUpdateTool from "./put/validate-member-update.js";
import FindMemberTool from "./get/find-member.js";
import GetMemberAreReferencedTool from "./get/get-member-are-referenced.js";
import GetMemberByIdReferencedByTool from "./get/get-member-by-id-referenced-by.js";
import GetMemberByIdReferencedDescendantsTool from "./get/get-member-by-id-referenced-descendants.js";
import GetItemMemberSearchTool from "./get/get-item-member-search.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { AuthorizationPolicies } from "auth/umbraco-auth-policies.js";
import {
  type ToolCollectionExport,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const MemberCollection: ToolCollectionExport = {
  metadata: {
    name: 'member',
    displayName: 'Members',
    description: 'Member account management and administration',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any, any>[] = [];
    if (AuthorizationPolicies.SectionAccessMembers(user)) {

      tools.push(GetMemberTool);
      tools.push(CreateMemberTool);
      tools.push(ValidateMemberTool);
      tools.push(DeleteMemberTool);
      tools.push(UpdateMemberTool);
      tools.push(ValidateMemberUpdateTool);
      tools.push(GetMemberAreReferencedTool);
      tools.push(GetMemberByIdReferencedByTool);
      tools.push(GetMemberByIdReferencedDescendantsTool);
    }
    tools.push(FindMemberTool);
    tools.push(GetItemMemberSearchTool);

    return tools;
  }
};

// Backwards compatibility export
export const MemberTools = (user: CurrentUserResponseModel) => {
  return MemberCollection.tools(user);
}; 