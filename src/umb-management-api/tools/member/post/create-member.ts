import { UmbracoManagementClient } from "@umb-management-client";
import { postMemberBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateMemberRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";
import { AxiosResponse } from "axios";

export const createMemberOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

const CreateMemberTool = {
  name: "create-member",
  description: `Creates a member in Umbraco.
  Use this endpoint to create new members with the specified properties and groups.`,
  inputSchema: postMemberBody.shape,
  outputSchema: createMemberOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreateMemberRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMember(model, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract ID from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdId = model.id || '';
      if (locationHeader) {
        const idMatch = locationHeader.match(/([0-9a-f-]{36})$/i);
        if (idMatch) {
          createdId = idMatch[1];
        }
      }
      return createToolResult({
        message: "Member created successfully",
        id: createdId
      });
    } else {
      const errorData: ProblemDetails = response.data || {
        status: response.status,
        detail: response.statusText,
      };
      return createToolResultError(errorData);
    }
  }),
} satisfies ToolDefinition<typeof postMemberBody.shape, typeof createMemberOutputSchema.shape>;

export default withStandardDecorators(CreateMemberTool);
