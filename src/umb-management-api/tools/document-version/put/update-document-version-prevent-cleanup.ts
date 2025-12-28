import { UmbracoManagementClient } from "@umb-management-client";
import { putDocumentVersionByIdPreventCleanupParams, putDocumentVersionByIdPreventCleanupQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

// Combined schema for both path params and query params
const updateDocumentVersionPreventCleanupSchema = putDocumentVersionByIdPreventCleanupParams.merge(
  putDocumentVersionByIdPreventCleanupQueryParams
);

type SchemaParams = z.infer<typeof updateDocumentVersionPreventCleanupSchema>;

const UpdateDocumentVersionPreventCleanupTool = {
  name: "update-document-version-prevent-cleanup",
  description: "Prevent cleanup for a specific document version",
  schema: updateDocumentVersionPreventCleanupSchema.shape,
  isReadOnly: false,
  slices: ['update'],
  handler: async ({ id, preventCleanup }: SchemaParams) => {
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
  },
} satisfies ToolDefinition<typeof updateDocumentVersionPreventCleanupSchema.shape>;

export default withStandardDecorators(UpdateDocumentVersionPreventCleanupTool);