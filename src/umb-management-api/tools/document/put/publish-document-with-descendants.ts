import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { putDocumentByIdPublishWithDescendantsBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const PublishDocumentWithDescendantsTool = CreateUmbracoWriteTool(
  "publish-document-with-descendants",
  `Publishes a document and its descendants by Id. This is an asynchronous operation that may take time for large document trees. 
  The tool will poll for completion and return the final result when finished.`,
  {
    id: z.string().uuid(),
    data: z.object(putDocumentByIdPublishWithDescendantsBody.shape),
  },
  async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    
    // Start the async publish operation
    const initialResponse = await client.putDocumentByIdPublishWithDescendants(
      model.id,
      model.data
    );
    
    // If already complete, return immediately
    if (initialResponse.isComplete) {
      return {
        content: [
          {
            type: "text" as const,
            text: "\"\"",
          },
        ],
      };
    }
    
    // Poll for completion with timeout (max 1 minute)
    const maxAttempts = 60; // 1 minutes with 1-second intervals
    const pollInterval = 1000; // 1 seconds
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      // Wait before polling
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      try {
        const statusResponse = await client.getDocumentByIdPublishWithDescendantsResultByTaskId(
          model.id,
          initialResponse.taskId
        );
        
        if (statusResponse.isComplete) {
          return {
            content: [
              {
                type: "text" as const,
                text: "\"\"",
              },
            ],
          };
        }
      } catch (error) {
        // If polling fails, return the error but include the taskId for manual checking
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                status: "error",
                taskId: initialResponse.taskId,
                message: `Failed to poll status: ${error}. You can manually check status using taskId.`
              }),
            },
          ],
        };
      }
    }
    
    // Timeout reached
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            status: "timeout",
            taskId: initialResponse.taskId,
            message: "Publish operation timed out after 1 minute. The operation may still be running. Use the taskId to check status manually."
          }),
        },
      ],
    };
  },
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Publish)
);

export default PublishDocumentWithDescendantsTool;
