import { UmbracoManagementClient } from "@umb-management-client";
import { getStylesheetByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetStylesheetByPathTool = {
  name: "get-stylesheet-by-path",
  description: "Gets a stylesheet by its path",
  schema: getStylesheetByPathParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async (model: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getStylesheetByPath(model.path);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getStylesheetByPathParams.shape>;

export default withStandardDecorators(GetStylesheetByPathTool);