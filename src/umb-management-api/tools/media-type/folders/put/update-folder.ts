import { UmbracoManagementClient } from "@umb-management-client";
import {
  putMediaTypeFolderByIdParams,
  putMediaTypeFolderByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updateMediaTypeFolderSchema = z.object({
  id: putMediaTypeFolderByIdParams.shape.id,
  data: z.object(putMediaTypeFolderByIdBody.shape),
});

const UpdateMediaTypeFolderTool = {
  name: "update-media-type-folder",
  description: "Updates a media type folder by Id",
  schema: updateMediaTypeFolderSchema.shape,
  isReadOnly: false,
  slices: ['update', 'folders'],
  handler: async (model: { id: string; data: { name: string } }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMediaTypeFolderById(model.id, model.data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updateMediaTypeFolderSchema.shape>;

export default withStandardDecorators(UpdateMediaTypeFolderTool);
