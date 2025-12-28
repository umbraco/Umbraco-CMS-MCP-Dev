import { UmbracoManagementClient } from "@umb-management-client";
import { getRecycleBinMediaRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type GetRecycleBinMediaRootParams = z.infer<typeof getRecycleBinMediaRootQueryParams>;

const GetRecycleBinMediaRootTool = {
  name: "get-recycle-bin-media-root",
  description: "Gets root items for the media recycle bin.",
  schema: getRecycleBinMediaRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree', 'recycle-bin'],
  handler: async (params: GetRecycleBinMediaRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinMediaRoot(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getRecycleBinMediaRootQueryParams.shape>;

export default withStandardDecorators(GetRecycleBinMediaRootTool);
