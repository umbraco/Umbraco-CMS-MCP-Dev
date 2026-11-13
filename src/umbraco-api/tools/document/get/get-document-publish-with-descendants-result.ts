import { getDocumentByIdPublishWithDescendantsResultByTaskIdParams, getDocumentByIdPublishWithDescendantsResultByTaskIdResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentPublishWithDescendantsResultTool = {
  name: "get-document-publish-with-descendants-result",
  description: `Gets the status/result of an in-progress or previously-polled publish-with-descendants operation by Id and taskId.
  Use this to follow up after publish-document-with-descendants reports the publish is still running, or returned an error.
  Returns isComplete: true once the publish has finished. If some descendants failed to publish, this returns an error result carrying the failed branch items.`,
  inputSchema: getDocumentByIdPublishWithDescendantsResultByTaskIdParams.shape,
  outputSchema: getDocumentByIdPublishWithDescendantsResultByTaskIdResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['publish'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Publish),
  handler: (async ({ id, taskId }: { id: string; taskId: string }) => {
    return executeGetApiCall((client) =>
      client.getDocumentByIdPublishWithDescendantsResultByTaskId(id, taskId, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentByIdPublishWithDescendantsResultByTaskIdParams.shape, typeof getDocumentByIdPublishWithDescendantsResultByTaskIdResponse.shape>;

export default withStandardDecorators(GetDocumentPublishWithDescendantsResultTool);
