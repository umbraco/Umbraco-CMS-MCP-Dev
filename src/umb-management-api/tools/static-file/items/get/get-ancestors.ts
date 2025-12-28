import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeStaticFileAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetTreeStaticFileAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetStaticFileAncestorsTool = {
  name: "get-static-file-ancestors",
  description: "Gets ancestor folders for navigation breadcrumbs by descendant path",
  schema: getTreeStaticFileAncestorsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeStaticFileAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeStaticFileAncestors(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getTreeStaticFileAncestorsQueryParams.shape>;

export default withStandardDecorators(GetStaticFileAncestorsTool);