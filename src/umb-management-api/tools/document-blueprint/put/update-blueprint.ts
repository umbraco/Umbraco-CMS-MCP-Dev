import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { UpdateDocumentBlueprintRequestModel } from "@/umb-management-api/schemas/updateDocumentBlueprintRequestModel.js";
import {
  putDocumentBlueprintByIdParams,
  putDocumentBlueprintByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const UpdateDocumentBlueprintTool = CreateUmbracoWriteTool(
  "update-document-blueprint",
  "Updates a document blueprint by Id",
  {
    id: putDocumentBlueprintByIdParams.shape.id,
    data: z.object(putDocumentBlueprintByIdBody.shape),
  },
  async (model: { id: string; data: UpdateDocumentBlueprintRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.putDocumentBlueprintById(model.id, model.data);
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

export default UpdateDocumentBlueprintTool;
