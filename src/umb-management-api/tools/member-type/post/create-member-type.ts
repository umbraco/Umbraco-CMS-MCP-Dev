import { UmbracoManagementClient } from "@umb-management-client";
import { CreateMemberTypeRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { postMemberTypeBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";
import { AxiosResponse } from "axios";

export const createMemberTypeOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

const CreateMemberTypeTool = {
  name: "create-member-type",
  description: "Creates a new member type",
  inputSchema: postMemberTypeBody.shape,
  outputSchema: createMemberTypeOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreateMemberTypeRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMemberType(model, {
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
        message: "Member type created successfully",
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
} satisfies ToolDefinition<typeof postMemberTypeBody.shape, typeof createMemberTypeOutputSchema.shape>;

export default withStandardDecorators(CreateMemberTypeTool);
