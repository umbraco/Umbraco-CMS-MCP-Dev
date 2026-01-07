import { getMemberTypeByIdCompositionReferencesParams, getMemberTypeByIdCompositionReferencesResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

// Array responses must be wrapped in an object
const outputSchema = z.object({
  items: getMemberTypeByIdCompositionReferencesResponse,
});

const GetMemberTypeCompositionReferencesTool = {
  name: "get-member-type-composition-references",
  description: "Gets the composition references for a member type",
  inputSchema: getMemberTypeByIdCompositionReferencesParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetItemsApiCall((client) =>
      client.getMemberTypeByIdCompositionReferences(id, CAPTURE_RAW_HTTP_RESPONSE)
    );  
  }),
} satisfies ToolDefinition<typeof getMemberTypeByIdCompositionReferencesParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMemberTypeCompositionReferencesTool);
