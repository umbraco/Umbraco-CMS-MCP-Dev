import GetMemberGroupTool from "./get/get-member-group.js";
import GetMemberGroupByIdArrayTool from "./get/get-member-group-by-id-array.js";
import GetMemberGroupRootTool from "./get/get-root.js";
import GetAllMemberGroupsTool from "./get/get-all-member-groups.js";
import CreateMemberGroupTool from "./post/create-member-group.js";
import UpdateMemberGroupTool from "./put/update-member-group.js";
import DeleteMemberGroupTool from "./delete/delete-member-group.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { AuthorizationPolicies } from "auth/umbraco-auth-policies.js";
import {
  type ToolCollectionExport,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const MemberGroupCollection: ToolCollectionExport = {
  metadata: {
    name: 'member-group',
    displayName: 'Member Groups',
    description: 'Member group management and organization',
    dependencies: ['member', 'member-type']
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any, any>[] = [];

    tools.push(GetMemberGroupTool);
    tools.push(GetMemberGroupByIdArrayTool);
    tools.push(GetAllMemberGroupsTool);

    if (AuthorizationPolicies.SectionAccessMembers(user)) {
      tools.push(CreateMemberGroupTool);
      tools.push(UpdateMemberGroupTool);
      tools.push(DeleteMemberGroupTool);
    }

    if (AuthorizationPolicies.TreeAccessMemberGroups(user)) {
      tools.push(GetMemberGroupRootTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const MemberGroupTools = (user: CurrentUserResponseModel) => {
  return MemberGroupCollection.tools(user);
};
