import { UmbracoManagementClient } from "@umb-management-client";
import { putDocumentByIdMoveBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const MoveDocumentTool = CreateUmbracoWriteTool(
  "move-document",
  "Move a document to a new location",
  {
    id: z.string().uuid(),
    data: z.object(putDocumentByIdMoveBody.shape),
  },
  async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentByIdMove(model.id, model.data);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Move)
);

export default MoveDocumentTool;
