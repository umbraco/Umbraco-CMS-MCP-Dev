import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const emptySchema = z.object({});

const PostModelsBuilderBuildTool = {
  name: "post-models-builder-build",
  description: `Triggers the generation/build of Models Builder models.
  This endpoint initiates the process of generating strongly-typed models from Umbraco content types.
  The operation runs asynchronously and does not return any response data.

  Use this tool to:
  - Generate models after making changes to document types, media types, or member types
  - Refresh models when they become out of date
  - Ensure the latest content type definitions are reflected in generated models

  Note: This operation may take some time to complete depending on the number of content types.
  Use get-models-builder-dashboard or get-models-builder-status to check the current state and if new models need to be generated.`,
  inputSchema: emptySchema.shape,
  slices: ['diagnostics'],
  handler: (async () => {
    return executeVoidApiCall((client) =>
      client.postModelsBuilderBuild(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof emptySchema.shape>;

export default withStandardDecorators(PostModelsBuilderBuildTool);
