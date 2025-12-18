import { UmbracoManagementClient } from "@umb-management-client";
import { UpdateScriptRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putScriptByPathBody,
  putScriptByPathParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updateScriptSchema = {
  path: putScriptByPathParams.shape.path,
  data: z.object(putScriptByPathBody.shape),
};

const UpdateScriptTool = {
  name: "update-script",
  description: "Updates a script by path",
  schema: updateScriptSchema,
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: { path: string; data: UpdateScriptRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putScriptByPath(model.path, model.data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updateScriptSchema>;

export default withStandardDecorators(UpdateScriptTool);