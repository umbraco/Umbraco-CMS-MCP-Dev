import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeStaticFileChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetTreeStaticFileChildrenParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetStaticFileChildrenTool = {
  name: "get-static-file-children",
  description: "Lists child files and folders in a static file directory by parent path",
  schema: getTreeStaticFileChildrenQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeStaticFileChildrenParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeStaticFileChildren(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getTreeStaticFileChildrenQueryParams.shape>;

export default withStandardDecorators(GetStaticFileChildrenTool);