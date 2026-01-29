import GetRelationTypeTool from "./get/get-relation-type.js";
import GetRelationTypeByIdTool from "./get/get-relation-type-by-id.js";
import { AuthorizationPolicies } from "auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import {
  type ToolCollectionExport,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const RelationTypeCollection: ToolCollectionExport = {
  metadata: {
    name: 'relation-type',
    displayName: 'Relation Type',
    description: 'Relation type management and configuration'
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any, any>[] = [];

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