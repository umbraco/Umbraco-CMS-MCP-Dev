import { UmbracoManagementClient } from "@umb-management-client";
import { postMediaTypeAvailableCompositionsBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMediaTypeAvailableCompositionsTool = {
  name: "get-media-type-available-compositions",
  description: "Gets the available compositions for a media type",
  schema: postMediaTypeAvailableCompositionsBody.shape,
  isReadOnly: true,
  slices: ['configuration'],
  handler: async (model) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMediaTypeAvailableCompositions(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postMediaTypeAvailableCompositionsBody.shape>;

export default withStandardDecorators(GetMediaTypeAvailableCompositionsTool);
