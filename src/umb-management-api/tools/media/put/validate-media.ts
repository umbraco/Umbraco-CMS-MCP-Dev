import { UmbracoManagementClient } from "@umb-management-client";
import {
  putMediaByIdValidateParams,
  putMediaByIdValidateBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const schema = {
  id: putMediaByIdValidateParams.shape.id,
  data: z.object(putMediaByIdValidateBody.shape),
};

const ValidateMediaUpdateTool = {
  name: "validate-media-update",
  description: "Validates media data before updating an existing media item by Id",
  schema,
  isReadOnly: true,
  slices: ['validate'],
  handler: async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMediaByIdValidate(model.id, model.data);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof schema>;

export default withStandardDecorators(ValidateMediaUpdateTool);
