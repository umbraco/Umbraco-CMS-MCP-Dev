import { UmbracoManagementClient } from "@umb-management-client";
import { postMediaValidateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type ValidateMediaParams = z.infer<typeof postMediaValidateBody>;

const ValidateMediaTool = {
  name: "validate-media",
  description: "Validates a media item using the Umbraco API.",
  schema: postMediaValidateBody.shape,
  isReadOnly: true,
  slices: ['validate'],
  handler: async (model: ValidateMediaParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMediaValidate(model);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postMediaValidateBody.shape>;

export default withStandardDecorators(ValidateMediaTool);
