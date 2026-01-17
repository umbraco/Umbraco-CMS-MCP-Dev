import { postMediaTypeAvailableCompositionsBody, postMediaTypeAvailableCompositionsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { MediaTypeCompositionRequestModel } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
