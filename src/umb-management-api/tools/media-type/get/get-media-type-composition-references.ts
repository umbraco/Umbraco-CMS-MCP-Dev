import { getMediaTypeByIdCompositionReferencesParams, getMediaTypeByIdCompositionReferencesResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

// Array responses must be wrapped in an object
const outputSchema = z.object({
  items: getMediaTypeByIdCompositionReferencesResponse,
});

const GetMediaTypeCompositionReferencesTool = {
  name: "get-media-type-composition-references",
  description: "Gets the composition references for a media type",
  inputSchema: getMediaTypeByIdCompositionReferencesParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaTypeByIdCompositionReferences(id);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getMediaTypeByIdCompositionReferencesParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMediaTypeCompositionReferencesTool);
