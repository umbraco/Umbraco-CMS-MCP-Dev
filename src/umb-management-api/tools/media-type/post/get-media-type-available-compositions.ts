import { postMediaTypeAvailableCompositionsBody, postMediaTypeAvailableCompositionsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { MediaTypeCompositionRequestModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMediaTypeAvailableCompositions(model);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof postMediaTypeAvailableCompositionsBody.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMediaTypeAvailableCompositionsTool);
