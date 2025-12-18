import { UmbracoManagementClient } from "@umb-management-client";
import {
  putMediaByIdParams,
  putMediaByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const schema = {
  id: putMediaByIdParams.shape.id,
  data: z.object(putMediaByIdBody.shape),
};

const UpdateMediaTool = {
  name: "update-media",
  description: `Updates a media item by Id. Works for all media types including folders, images, files, videos, etc.
  Always read the current media value first and only update the required values.
  Don't miss any properties from the original media that you are updating.
  This cannot be used for moving media to a new folder. Use the move endpoint to do that.`,
  schema,
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMediaById(model.id, model.data);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof schema>;

export default withStandardDecorators(UpdateMediaTool);
