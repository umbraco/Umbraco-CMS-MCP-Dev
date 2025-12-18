import { UmbracoManagementClient } from "@umb-management-client";
import { postRedirectManagementStatusQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type SchemaParams = z.infer<typeof postRedirectManagementStatusQueryParams>;

const UpdateRedirectStatusTool = {
  name: "update-redirect-status",
  description: `Updates the status of redirect management.
  Parameters:
  - status: The new status, either "Enabled" or "Disabled" (string)

  Returns no content on success.`,
  schema: postRedirectManagementStatusQueryParams.shape,
  isReadOnly: false,
  slices: ['update'],
  handler: async ({ status }: SchemaParams) => {
    const client = UmbracoManagementClient.getClient();
    await client.postRedirectManagementStatus({ status });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ status }),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postRedirectManagementStatusQueryParams.shape>;

export default withStandardDecorators(UpdateRedirectStatusTool);
