import CreateMemberTypeTool from "./post/create-member-type.js";
import GetMemberTypesByIdArrayTool from "./get/get-member-type-by-id-array.js";
import GetMemberTypeByIdTool from "./get/get-member-type-by-id.js";
import DeleteMemberTypeTool from "./delete/delete-member-type.js";
import UpdateMemberTypeTool from "./put/update-member-type.js";
import CopyMemberTypeTool from "./post/copy-member-type.js";
import GetMemberTypeAvailableCompositionsTool from "./post/get-member-type-available-compositions.js";
import GetMemberTypeCompositionReferencesTool from "./get/get-member-type-composition-references.js";
import GetMemberTypeConfigurationTool from "./get/get-member-type-configuration.js";
import GetMemberTypeRootTool from "./items/get/get-root.js";
import GetMemberTypeSiblingsTool from "./items/get/get-siblings.js";
import SearchMemberTypeItemsTool from "./get/get-item-member-type-search.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const MemberTypeCollection: ToolCollectionExport = {
  metadata: {
    name: 'member-type',
    displayName: 'Member Types',
    description: 'Member type definitions and composition management',
    dependencies: ['member', 'member-group']
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [];

    tools.push(GetMemberTypeByIdTool);

    if (AuthorizationPolicies.TreeAccessMembersOrMemberTypes(user)) {
      tools.push(CreateMemberTypeTool);
      tools.push(GetMemberTypesByIdArrayTool);
      tools.push(DeleteMemberTypeTool);
      tools.push(UpdateMemberTypeTool);
      tools.push(CopyMemberTypeTool);
      tools.push(GetMemberTypeAvailableCompositionsTool);
      tools.push(GetMemberTypeCompositionReferencesTool);
      tools.push(GetMemberTypeConfigurationTool);
      tools.push(GetMemberTypeRootTool);
      tools.push(GetMemberTypeSiblingsTool);
      tools.push(SearchMemberTypeItemsTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const MemberTypeTools = (user: CurrentUserResponseModel) => {
  return MemberTypeCollection.tools(user);
}; 