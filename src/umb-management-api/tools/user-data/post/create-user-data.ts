import { UmbracoManagementClient } from "@umb-management-client";
import { postUserDataBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateUserDataRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { AxiosResponse } from "axios";

export const createUserDataOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

const CreateUserDataTool = {
  name: "create-user-data",
  description: "Creates a new user data record",
  inputSchema: postUserDataBody.shape,
  outputSchema: createUserDataOutputSchema.shape,
  slices: ['create'],
  handler: (async (body: CreateUserDataRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postUserData(body, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract ID from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdId = '';
      if (locationHeader) {
        // Location header format: /umbraco/management/api/v1/user-data/{id}
        const idMatch = locationHeader.match(/user-data\/([a-f0-9-]+)$/i);
        if (idMatch) {
          createdId = idMatch[1];
        }
      }
      return createToolResult({
        message: "User data created successfully",
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
} satisfies ToolDefinition<typeof postUserDataBody.shape, typeof createUserDataOutputSchema.shape>;

export default withStandardDecorators(CreateUserDataTool);