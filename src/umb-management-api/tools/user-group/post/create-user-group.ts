import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUserGroupRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { postUserGroupBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { AxiosResponse } from "axios";
import {
  type ToolDefinition,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

export const createUserGroupOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

const CreateUserGroupTool = {
  name: "create-user-group",
  description: "Creates a new user group",
  inputSchema: postUserGroupBody.shape,
  outputSchema: createUserGroupOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreateUserGroupRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postUserGroup(model, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract ID from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdId = '';
      if (locationHeader) {
        // Location header format: /umbraco/management/api/v1/user-group/{id}
        const idMatch = locationHeader.match(/user-group\/([a-f0-9-]+)$/i);
        if (idMatch) {
          createdId = idMatch[1];
        }
      }
      return createToolResult({
        message: "User group created successfully",
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
} satisfies ToolDefinition<typeof postUserGroupBody.shape, typeof createUserGroupOutputSchema.shape>;

export default withStandardDecorators(CreateUserGroupTool);
