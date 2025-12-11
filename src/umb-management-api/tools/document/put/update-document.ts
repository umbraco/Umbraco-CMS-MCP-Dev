import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import {
  putDocumentByIdParams,
  putDocumentByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const UpdateDocumentTool = CreateUmbracoWriteTool(
  "update-document",
  `Updates a document by Id. USE AS LAST RESORT ONLY.

  IMPORTANT: Prefer these specialized tools instead:
  - update-document-properties: For updating individual property values (simpler, safer)
  - update-block-property: For updating properties within BlockList/BlockGrid/RichText blocks

  Only use this tool when you need to update document-level metadata (template, variants)
  or when the specialized tools cannot handle your specific use case.

  If you must use this tool:
  - Always read the current document value first
  - Only update the required values
  - Don't miss any properties from the original document`,
  {
    id: putDocumentByIdParams.shape.id,
    data: z.object(putDocumentByIdBody.shape),
  },
  async (model: { id: string; data: any }) => {
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
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Update)
);

export default UpdateDocumentTool;
