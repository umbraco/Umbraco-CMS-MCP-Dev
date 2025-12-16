import { UmbracoManagementClient } from "@umb-management-client";
import { UpdatePartialViewRequestModel } from "@/umb-management-api/schemas/index.js";
import { putPartialViewByPathParams, putPartialViewByPathBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updatePartialViewSchema = z.object({
  ...putPartialViewByPathParams.shape,
  ...putPartialViewByPathBody.shape,
});

const UpdatePartialViewTool = {
  name: "update-partial-view",
  description: "Updates a partial view",
  schema: updatePartialViewSchema.shape,
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: { path: string } & UpdatePartialViewRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const { path, ...updateModel } = model;
    var response = await client.putPartialViewByPath(path, updateModel);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updatePartialViewSchema.shape>;

export default withStandardDecorators(UpdatePartialViewTool);