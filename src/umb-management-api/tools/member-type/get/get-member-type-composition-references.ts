import { getMemberTypeByIdCompositionReferencesParams, getMemberTypeByIdCompositionReferencesResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMemberTypeByIdCompositionReferences(id);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getMemberTypeByIdCompositionReferencesParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMemberTypeCompositionReferencesTool);
