import { UmbracoManagementClient } from "@umb-management-client";
import {
  putDataTypeFolderByIdParams,
  putDataTypeFolderByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updateDataTypeFolderSchema = {
  id: putDataTypeFolderByIdParams.shape.id,
  data: z.object(putDataTypeFolderByIdBody.shape),
};

const UpdateDataTypeFolderTool = {
  name: "update-data-type-folder",
  description: "Updates a data type folder by Id",
  schema: updateDataTypeFolderSchema,
  isReadOnly: false,
  slices: ['update', 'folders'],
  handler: async (model: { id: string; data: { name: string } }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDataTypeFolderById(model.id, model.data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updateDataTypeFolderSchema>;

export default withStandardDecorators(UpdateDataTypeFolderTool);
