import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
