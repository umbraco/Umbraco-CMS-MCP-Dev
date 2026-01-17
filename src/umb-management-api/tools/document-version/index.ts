import GetDocumentVersionTool from "./get/get-document-version.js";
import GetDocumentVersionByIdTool from "./get/get-document-version-by-id.js";
import UpdateDocumentVersionPreventCleanupTool from "./put/update-document-version-prevent-cleanup.js";
import CreateDocumentVersionRollbackTool from "./post/create-document-version-rollback.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { ToolCollectionExport } from "types/tool-collection.js";
import {
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const DocumentVersionCollection: ToolCollectionExport = {
  metadata: {
    name: 'document-version',
    displayName: 'Document Version',
    description: 'Document version management and rollback operations',
    dependencies: ['document']
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any, any>[] = [];

    if (AuthorizationPolicies.SectionAccessContent(user)) {
      tools.push(GetDocumentVersionTool);
      tools.push(GetDocumentVersionByIdTool);
      tools.push(UpdateDocumentVersionPreventCleanupTool);
      tools.push(CreateDocumentVersionRollbackTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const DocumentVersionTools = (user: CurrentUserResponseModel) => {
  return DocumentVersionCollection.tools(user);
};