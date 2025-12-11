import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { putDocumentByIdPublishBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const PublishDocumentTool = CreateUmbracoWriteTool(
  "publish-document",
  `Publishes a document by Id. IMPORTANT: If workflow approval is required, use the initiate-workflow-action function instead. 
  This function bypasses approval workflows and publishes directly to the live site. 
  When the culture is not provided, the default culture is null.
  When the schedule is not provided, the default schedule is null.`,
  {
    id: z.string().uuid(),
    data: z.object(putDocumentByIdPublishBody.shape),
  },
  async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();

    // If no publish schedules are provided, set the default to publish to all cultures
    if (!model.data.publishSchedules) {
      model.data.publishSchedules = [{ culture: null }];
    }

    const response = await client.putDocumentByIdPublish(model.id, model.data);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Publish)
);

export default PublishDocumentTool;
