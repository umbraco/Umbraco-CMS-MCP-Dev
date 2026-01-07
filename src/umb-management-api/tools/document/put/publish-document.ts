import { putDocumentByIdPublishBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const inputSchema = {
  id: z.string().uuid(),
  data: z.object(putDocumentByIdPublishBody.shape),
};

const PublishDocumentTool = {
  name: "publish-document",
  description: `Publishes a document by Id. IMPORTANT: If workflow approval is required, use the initiate-workflow-action function instead.
  This function bypasses approval workflows and publishes directly to the live site.
  When the culture is not provided, the default culture is null.
  When the schedule is not provided, the default schedule is null.`,
  inputSchema: inputSchema,
  annotations: {},
  slices: ['publish'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Publish),
  handler: (async (model: { id: string; data: any }) => {
    // If no publish schedules are provided, set the default to publish to all cultures
    if (!model.data.publishSchedules) {
      model.data.publishSchedules = [{ culture: null }];
    }

    return executeVoidApiCall((client) =>
      client.putDocumentByIdPublish(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(PublishDocumentTool);
