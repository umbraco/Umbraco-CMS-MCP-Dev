import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeStaticFileRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetTreeStaticFileRootParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetStaticFileRootTool = {
  name: "get-static-file-root",
  description: "Gets root-level static files and folders in the Umbraco file system",
  schema: getTreeStaticFileRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeStaticFileRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeStaticFileRoot(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getTreeStaticFileRootQueryParams.shape>;

export default withStandardDecorators(GetStaticFileRootTool);