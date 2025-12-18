import { UmbracoManagementClient } from "@umb-management-client";
import { UpdateStylesheetRequestModel } from "@/umb-management-api/schemas/index.js";
import { putStylesheetByPathParams, putStylesheetByPathBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const updateStylesheetSchema = z.object({
  ...putStylesheetByPathParams.shape,
  ...putStylesheetByPathBody.shape,
});

const UpdateStylesheetTool = {
  name: "update-stylesheet",
  description: "Updates a stylesheet by path",
  schema: updateStylesheetSchema.shape,
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: { path: string } & UpdateStylesheetRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const { path, ...updateModel } = model;
    var response = await client.putStylesheetByPath(path, updateModel);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof updateStylesheetSchema.shape>;

export default withStandardDecorators(UpdateStylesheetTool);