import GetMemberGroupTool from "./get/get-member-group.js";
import GetMemberGroupByIdArrayTool from "./get/get-member-group-by-id-array.js";
import GetMemberGroupRootTool from "./get/get-root.js";
import CreateMemberGroupTool from "./post/create-member-group.js";
import UpdateMemberGroupTool from "./put/update-member-group.js";
import DeleteMemberGroupTool from "./delete/delete-member-group.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const MemberGroupCollection: ToolCollectionExport = {
  metadata: {
    name: 'member-group',
    displayName: 'Member Groups',
    description: 'Member group management and organization',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [];

    tools.push(GetMemberGroupTool());
    tools.push(GetMemberGroupByIdArrayTool());

    if (AuthorizationPolicies.SectionAccessMembers(user)) {
      tools.push(CreateMemberGroupTool());
      tools.push(UpdateMemberGroupTool());
      tools.push(DeleteMemberGroupTool());
    }

    if (AuthorizationPolicies.TreeAccessMemberGroups(user)) {
      tools.push(GetMemberGroupRootTool());
    }

    return tools;
  }
};

// Backwards compatibility export
export const MemberGroupTools = (user: CurrentUserResponseModel) => {
  return MemberGroupCollection.tools(user);
};