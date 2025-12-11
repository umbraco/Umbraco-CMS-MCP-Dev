import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import {
  putDocumentTypeByIdParams,
  putDocumentTypeByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const ValidateDocumentTypeTool = CreateUmbracoReadTool(
  "validate-document-type",
  "Validates a document type using the Umbraco API (PUT, does not persist changes).",
  {
    id: putDocumentTypeByIdParams.shape.id,
    data: z.object(putDocumentTypeByIdBody.shape),
  },
  async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentTypeById(model.id, model.data);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
);

export default ValidateDocumentTypeTool;
