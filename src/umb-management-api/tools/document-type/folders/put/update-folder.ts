import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import {
  putDocumentTypeFolderByIdParams,
  putDocumentTypeFolderByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const UpdateDocumentTypeFolderTool = CreateUmbracoWriteTool(
  "update-document-type-folder",
  "Updates a document type folder by Id",
  {
    id: putDocumentTypeFolderByIdParams.shape.id,
    data: z.object(putDocumentTypeFolderByIdBody.shape),
  },
  async (model: { id: string; data: { name: string } }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentTypeFolderById(
      model.id,
      model.data
    );

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

export default UpdateDocumentTypeFolderTool;
