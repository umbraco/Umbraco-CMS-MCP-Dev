import { postMediaTypeAvailableCompositionsBody, postMediaTypeAvailableCompositionsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { MediaTypeCompositionRequestModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

// Array responses must be wrapped in an object
const outputSchema = z.object({
  items: postMediaTypeAvailableCompositionsResponse,
});

const GetMediaTypeAvailableCompositionsTool = {
  name: "get-media-type-available-compositions",
  description: "Gets the available compositions for a media type",
  inputSchema: postMediaTypeAvailableCompositionsBody.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async (model: MediaTypeCompositionRequestModel) => {
    return executeGetItemsApiCall((client) =>
      client.postMediaTypeAvailableCompositions(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postMediaTypeAvailableCompositionsBody.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMediaTypeAvailableCompositionsTool);
