import { UmbracoManagementClient } from "@umb-management-client";
import { getScriptByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetScriptByPathTool = {
  name: "get-script-by-path",
  description: "Gets a script by path",
  schema: getScriptByPathParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ path }: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getScriptByPath(path);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getScriptByPathParams.shape>;

export default withStandardDecorators(GetScriptByPathTool);