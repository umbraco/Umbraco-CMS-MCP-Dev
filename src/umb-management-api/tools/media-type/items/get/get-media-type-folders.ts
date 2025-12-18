import { UmbracoManagementClient } from "@umb-management-client";
import { GetItemMediaTypeFoldersParams } from "@/umb-management-api/schemas/index.js";
import { getItemMediaTypeFoldersQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMediaTypeFoldersTool = {
  name: "get-media-type-folders",
  description: "Lists media type folders with pagination support",
  schema: getItemMediaTypeFoldersQueryParams.shape,
  isReadOnly: true,
  slices: ['list', 'folders'],
  handler: async (params: GetItemMediaTypeFoldersParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMediaTypeFolders(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemMediaTypeFoldersQueryParams.shape>;

export default withStandardDecorators(GetMediaTypeFoldersTool);