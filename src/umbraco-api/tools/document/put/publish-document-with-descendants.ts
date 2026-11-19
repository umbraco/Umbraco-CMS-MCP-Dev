import { UmbracoManagementClient } from "@umb-management-client";
import { putDocumentByIdPublishWithDescendantsBody } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel, ProblemDetails } from "@/umbraco-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  createToolResultError,
  toProblemDetails,
  withStandardDecorators,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: z.string().uuid(),
  data: z.object(putDocumentByIdPublishWithDescendantsBody.shape),
};

const PublishDocumentWithDescendantsTool = {
  name: "publish-document-with-descendants",
  description: `Publishes a document and its descendants by Id. This is an asynchronous operation that may take time for large document trees.
  The tool polls for completion for up to 60 seconds. If the publish is still running or ambiguous when that limit is reached, follow up with get-document-publish-with-descendants-result using the returned taskId.`,
  inputSchema: inputSchema,
  annotations: {
    // Unlike the other document put/ tools, this one starts a new async,
    // recursive publish task on every call rather than converging to the
    // same end state — a retried call fires a second concurrent job over
    // the same subtree, so it is not safe to advertise as idempotent.
    idempotentHint: false,
  },
  slices: ['publish'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Publish),
  handler: (async (model: { id: string; data: any }) => {
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

      let statusResponse: HttpResponse<ProblemDetails | { taskId: string; isComplete: boolean }>;
      try {
        statusResponse = await client.getDocumentByIdPublishWithDescendantsResultByTaskId(
          model.id,
          initialResponse.taskId,
          CAPTURE_RAW_HTTP_RESPONSE
        ) as unknown as HttpResponse<ProblemDetails | { taskId: string; isComplete: boolean }>;
      } catch (error) {
        // The poll HTTP call itself failed (network error, etc).
        return createToolResultError({
          type: "Error",
          title: "Failed to poll publish-with-descendants status",
          detail: error instanceof Error ? error.message : String(error),
          status: 500,
          taskId: initialResponse.taskId,
        });
      }

      if (statusResponse.status >= 200 && statusResponse.status < 300) {
        const data = statusResponse.data as { taskId: string; isComplete: boolean } | undefined;
        if (data?.isComplete) {
          return {
            content: [
              {
                type: "text" as const,
                text: "\"\"",
              },
            ],
          };
        }
        // Not complete yet - keep polling
        continue;
      }

      // The CMS came back with a ProblemDetails error - some branch items
      // may have failed to publish (see failedBranchItems on the body).
      // Keep the taskId (and document id) on the error so the caller can still
      // follow up with get-document-publish-with-descendants-result.
      return createToolResultError({
        ...toProblemDetails(statusResponse),
        documentId: model.id,
        taskId: initialResponse.taskId,
      });
    }

    // Timeout reached. This is NOT an error - nothing has failed, the publish
    // may simply still be running on a large tree.
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            status: "in-progress",
            taskId: initialResponse.taskId,
            message: `Publishing is still in progress after 60 seconds. Use get-document-publish-with-descendants-result with id "${model.id}" and taskId "${initialResponse.taskId}" to check whether it has finished.`
          }),
        },
      ],
    };
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(PublishDocumentWithDescendantsTool);
