import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const EmptyElementRecycleBinTool = {
  name: "empty-element-recycle-bin",
  description: "Empties the element recycle bin.",
  inputSchema: {},
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete', 'recycle-bin'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Delete),
  handler: (async () => {
    return executeVoidApiCall((client) =>
      client.deleteRecycleBinElement(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<Record<string, never>>;

export default withStandardDecorators(EmptyElementRecycleBinTool);
