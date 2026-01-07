import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const EmptyRecycleBinTool = {
  name: "empty-media-recycle-bin",
  description: "Empties the media recycle bin.",
  inputSchema: {},
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete', 'recycle-bin'],
  handler: (async () => {
    return executeVoidApiCall((client) =>
      client.deleteRecycleBinMedia(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(EmptyRecycleBinTool);
