import { UmbracoManagementClient } from "@umb-management-client";
import {
  getItemMediaQueryParams,
  getItemMediaResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type GetItemMediaParams = z.infer<typeof getItemMediaQueryParams>;

const GetMediaByIdArrayTool = {
  name: "get-media-by-id-array",
  description: "Gets media items by an array of IDs",
  schema: getItemMediaQueryParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async (params: GetItemMediaParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMedia(params);
    // Validate response shape
    getItemMediaResponse.parse(response);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemMediaQueryParams.shape>;

export default withStandardDecorators(GetMediaByIdArrayTool);
