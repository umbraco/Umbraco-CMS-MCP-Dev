import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postDocumentVersionByIdRollbackParams, postDocumentVersionByIdRollbackQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

// Combined schema for both path params and query params
const createDocumentVersionRollbackSchema = postDocumentVersionByIdRollbackParams.merge(
  postDocumentVersionByIdRollbackQueryParams
);

const CreateDocumentVersionRollbackTool = CreateUmbracoWriteTool(
  "create-document-version-rollback",
  "Rollback document to a specific version",
  createDocumentVersionRollbackSchema.shape,
  async ({ id, culture }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postDocumentVersionByIdRollback(id, { culture });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response ?? "Rollback completed successfully"),
        },
      ],
    };
  }
);

export default CreateDocumentVersionRollbackTool;