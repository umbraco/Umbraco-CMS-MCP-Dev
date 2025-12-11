import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { putDocumentVersionByIdPreventCleanupParams, putDocumentVersionByIdPreventCleanupQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

// Combined schema for both path params and query params
const updateDocumentVersionPreventCleanupSchema = putDocumentVersionByIdPreventCleanupParams.merge(
  putDocumentVersionByIdPreventCleanupQueryParams
);

const UpdateDocumentVersionPreventCleanupTool = CreateUmbracoWriteTool(
  "update-document-version-prevent-cleanup",
  "Prevent cleanup for a specific document version",
  updateDocumentVersionPreventCleanupSchema.shape,
  async ({ id, preventCleanup }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentVersionByIdPreventCleanup(id, { preventCleanup });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response ?? "Operation completed successfully"),
        },
      ],
    };
  }
);

export default UpdateDocumentVersionPreventCleanupTool;