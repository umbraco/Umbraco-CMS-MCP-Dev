import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const EmptyRecycleBinTool = {
  name: "empty-recycle-bin",
  description: "Empties the document recycle bin.",
  inputSchema: {},
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete', 'recycle-bin'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Delete),
  handler: (async () => {
    return executeVoidApiCall((client) =>
      client.deleteRecycleBinDocument(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<Record<string, never>>;

export default withStandardDecorators(EmptyRecycleBinTool);
