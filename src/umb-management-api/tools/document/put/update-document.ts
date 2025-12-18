import { UmbracoManagementClient } from "@umb-management-client";
import {
  putDocumentByIdParams,
  putDocumentByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updateDocumentSchema = {
  id: putDocumentByIdParams.shape.id,
  data: z.object(putDocumentByIdBody.shape),
};

const UpdateDocumentTool = {
  name: "update-document",
  description: `Updates a document by Id. USE AS LAST RESORT ONLY.

  IMPORTANT: Prefer these specialized tools instead:
  - update-document-properties: For updating individual property values (simpler, safer)
  - update-block-property: For updating properties within BlockList/BlockGrid/RichText blocks

  Only use this tool when you need to update document-level metadata (template, variants)
  or when the specialized tools cannot handle your specific use case.

  If you must use this tool:
  - Always read the current document value first
  - Only update the required values
  - Don't miss any properties from the original document`,
  schema: updateDocumentSchema,
  isReadOnly: false,
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Update),
  handler: async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentById(model.id, model.data);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updateDocumentSchema>;

export default withStandardDecorators(UpdateDocumentTool);
