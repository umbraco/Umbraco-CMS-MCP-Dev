import { UmbracoManagementClient } from "@umb-management-client";
import { putDocumentTypeByIdMoveBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { MoveDocumentTypeRequestModel } from "@/umb-management-api/schemas/moveDocumentTypeRequestModel.js";
import { z } from "zod";

const MoveDocumentTypeTool = CreateUmbracoWriteTool(
  "move-document-type",
  "Move a document type to a new location",
  {
    id: z.string().uuid(),
    data: z.object(putDocumentTypeByIdMoveBody.shape),
  },
  async (model: { id: string; data: MoveDocumentTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentTypeByIdMove(model.id, model.data);

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

export default MoveDocumentTypeTool;
