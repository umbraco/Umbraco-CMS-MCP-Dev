import { postMemberTypeAvailableCompositionsBody, postMemberTypeAvailableCompositionsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { MemberTypeCompositionRequestModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

// Array responses must be wrapped in an object
const outputSchema = z.object({
  items: postMemberTypeAvailableCompositionsResponse,
});

const GetMemberTypeAvailableCompositionsTool = {
  name: "get-member-type-available-compositions",
  description: "Gets the available compositions for a member type",
  inputSchema: postMemberTypeAvailableCompositionsBody.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async (model: MemberTypeCompositionRequestModel) => {
    return executeGetItemsApiCall((client) =>
      client.postMemberTypeAvailableCompositions(model, CAPTURE_RAW_HTTP_RESPONSE)
    );  
  }),
} satisfies ToolDefinition<typeof postMemberTypeAvailableCompositionsBody.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMemberTypeAvailableCompositionsTool);
