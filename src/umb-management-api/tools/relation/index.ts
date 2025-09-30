import GetRelationByRelationTypeIdTool from "./get/get-relation-by-relation-type-id.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const RelationCollection: ToolCollectionExport = {
  metadata: {
    name: 'relation',
    displayName: 'Relation',
    description: 'Relation management and querying'
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [];

    if (AuthorizationPolicies.TreeAccessRelationTypes(user)) {
      tools.push(GetRelationByRelationTypeIdTool());
    }

    return tools;
  }
};

// Backwards compatibility export (can be removed later)
export const RelationTools = (user: CurrentUserResponseModel) => {
  return RelationCollection.tools(user);
};