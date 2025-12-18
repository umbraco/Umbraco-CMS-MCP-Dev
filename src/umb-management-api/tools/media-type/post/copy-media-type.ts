import { UmbracoManagementClient } from "@umb-management-client";
import { postMediaTypeByIdCopyBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CopyMediaTypeRequestModel } from "@/umb-management-api/schemas/copyMediaTypeRequestModel.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const copyMediaTypeSchema = z.object({
  id: z.string().uuid(),
  data: z.object(postMediaTypeByIdCopyBody.shape),
});

const CopyMediaTypeTool = {
  name: "copy-media-type",
  description: "Copy a media type to a new location",
  schema: copyMediaTypeSchema.shape,
  isReadOnly: false,
  slices: ['copy'],
  handler: async (model: { id: string; data: CopyMediaTypeRequestModel }) => {
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
  },
} satisfies ToolDefinition<typeof copyMediaTypeSchema.shape>;

export default withStandardDecorators(CopyMediaTypeTool);
