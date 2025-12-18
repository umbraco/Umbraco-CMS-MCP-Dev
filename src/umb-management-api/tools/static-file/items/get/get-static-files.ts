import { UmbracoManagementClient } from "@umb-management-client";
import { getItemStaticFileQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemStaticFileParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetStaticFilesTool = {
  name: "get-static-files",
  description: "Lists static files with optional path filtering for browsing the file system",
  schema: getItemStaticFileQueryParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async (params: GetItemStaticFileParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemStaticFile(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getItemStaticFileQueryParams.shape>;

export default withStandardDecorators(GetStaticFilesTool);