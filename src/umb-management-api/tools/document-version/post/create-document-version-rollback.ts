import { UmbracoManagementClient } from "@umb-management-client";
import { postDocumentVersionByIdRollbackParams, postDocumentVersionByIdRollbackQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

// Combined schema for both path params and query params
const createDocumentVersionRollbackSchema = postDocumentVersionByIdRollbackParams.merge(
  postDocumentVersionByIdRollbackQueryParams
);

const CreateDocumentVersionRollbackTool = {
  name: "create-document-version-rollback",
  description: "Rollback document to a specific version",
  schema: createDocumentVersionRollbackSchema.shape,
  isReadOnly: false,
  slices: ['create'],
  handler: async ({ id, culture }: { id: string; culture?: string }) => {
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
  },
} satisfies ToolDefinition<typeof createDocumentVersionRollbackSchema.shape>;

export default withStandardDecorators(CreateDocumentVersionRollbackTool);