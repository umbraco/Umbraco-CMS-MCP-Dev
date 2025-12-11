import { UmbracoManagementClient } from "@umb-management-client";
import { postMediaTypeByIdCopyBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";
import { CopyMediaTypeRequestModel } from "@/umb-management-api/schemas/copyMediaTypeRequestModel.js";

const CopyMediaTypeTool = CreateUmbracoWriteTool(
  "copy-media-type",
  "Copy a media type to a new location",
  {
    id: z.string().uuid(),
    data: z.object(postMediaTypeByIdCopyBody.shape),
  },
  async (model: { id: string; data: CopyMediaTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMediaTypeByIdCopy(model.id, model.data);

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

export default CopyMediaTypeTool;
