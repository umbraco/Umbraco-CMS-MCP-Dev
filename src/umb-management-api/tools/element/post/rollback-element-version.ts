import { postElementVersionByIdRollbackParams, postElementVersionByIdRollbackQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Combined schema for both path params and query params
const rollbackElementVersionSchema = postElementVersionByIdRollbackParams.merge(
  postElementVersionByIdRollbackQueryParams
);

const RollbackElementVersionTool = {
  name: "rollback-element-version",
  description: "Rollback an element to a specific version",
  inputSchema: rollbackElementVersionSchema.shape,
  slices: ['rollback'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Rollback),
  handler: (async ({ id, culture }: { id: string; culture?: string }) => {
    return executeVoidApiCall((client) =>
      client.postElementVersionByIdRollback(id, { culture }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof rollbackElementVersionSchema.shape>;

export default withStandardDecorators(RollbackElementVersionTool);
