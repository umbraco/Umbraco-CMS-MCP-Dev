import { UmbracoManagementClient } from "@umb-management-client";
import { UpdateMediaTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putMediaTypeByIdParams,
  putMediaTypeByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updateMediaTypeSchema = z.object({
  id: putMediaTypeByIdParams.shape.id,
  data: z.object(putMediaTypeByIdBody.shape),
});

const UpdateMediaTypeTool = {
  name: "update-media-type",
  description: "Updates a media type by Id",
  schema: updateMediaTypeSchema.shape,
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: { id: string; data: UpdateMediaTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMediaTypeById(model.id, model.data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updateMediaTypeSchema.shape>;

export default withStandardDecorators(UpdateMediaTypeTool);
