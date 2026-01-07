import { UmbracoManagementClient } from "@umb-management-client";
import { postLanguageBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { AxiosResponse } from "axios";
import { ProblemDetails } from "@/umb-management-api/schemas/index.js";

export const createOutputSchema = z.object({
  message: z.string(),
  isoCode: z.string()
});

type CreateLanguageModel = z.infer<typeof postLanguageBody>;

const CreateLanguageTool = {
  name: "create-language",
  description: "Creates a new language",
  inputSchema: postLanguageBody.shape,
  outputSchema: createOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreateLanguageModel) => {
    const client = UmbracoManagementClient.getClient();
    const validated = postLanguageBody.parse(model);

    const response = await client.postLanguage(validated, CAPTURE_RAW_HTTP_RESPONSE) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      return createToolResult({
        message: "Language created successfully",
        isoCode: validated.isoCode
      });
    } else {
      return createToolResultError(response.data || {
        status: response.status,
        detail: response.statusText
      });
    }
  }),
} satisfies ToolDefinition<typeof postLanguageBody.shape, typeof createOutputSchema.shape>;

export default withStandardDecorators(CreateLanguageTool);
