import GetRelationTypeTool from "./get/get-relation-type.js";
import GetRelationTypeByIdTool from "./get/get-relation-type-by-id.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const RelationTypeCollection: ToolCollectionExport = {
  metadata: {
    name: 'relation-type',
    displayName: 'Relation Type',
    description: 'Relation type management and configuration'
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [];

    if (AuthorizationPolicies.TreeAccessRelationTypes(user)) {
      tools.push(GetRelationTypeTool);
      tools.push(GetRelationTypeByIdTool);
    }

    return tools;
  }
};

// Backwards compatibility export (can be removed later)
export const RelationTypeTools = (user: CurrentUserResponseModel) => {
  return RelationTypeCollection.tools(user);
};