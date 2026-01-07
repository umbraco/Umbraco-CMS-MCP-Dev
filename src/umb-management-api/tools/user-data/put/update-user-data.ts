import { UpdateUserDataRequestModel } from "@/umb-management-api/schemas/index.js";
import { putUserDataBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const UpdateUserDataTool = {
  name: "update-user-data",
  description: "Updates an existing user data record",
  inputSchema: putUserDataBody.shape,
  annotations: { idempotentHint: true },
  slices: ['update'],
  handler: (async (body: UpdateUserDataRequestModel) => {
    return executeVoidApiCall((client) =>
      client.putUserData(body, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putUserDataBody.shape>;

export default withStandardDecorators(UpdateUserDataTool);