import {
  putDocumentByIdUpdateAndPublishParams,
  putDocumentByIdUpdateAndPublishBody,
} from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: putDocumentByIdUpdateAndPublishParams.shape.id,
  data: z.object(putDocumentByIdUpdateAndPublishBody.shape),
};

const UpdateAndPublishDocumentTool = {
  name: "update-and-publish-document",
  description: `Updates a document by Id and publishes it in a single operation.

  IMPORTANT: If workflow approval is required, use update-document followed by initiate-workflow-action instead.
  This function bypasses approval workflows and publishes directly to the live site.

  ### Cultures To Publish
  - culturesToPublish controls which of the document's variants get published.
  - Umbraco only accepts real culture codes here - wildcards ("*") and nulls are rejected with an error.
  - When the document does not vary by culture (invariant content), pass an empty array \`[]\` to publish the single invariant variant.
  - When the document varies by culture, provide the culture codes of the variants you want published.

  If you must use this tool:
  - Always read the current document value first
  - Only update the required values
  - Don't miss any properties from the original document`,
  inputSchema: inputSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Publish),
  handler: (async (model: { id: string; data: any }) => {
    return executeVoidApiCall((client) =>
      client.putDocumentByIdUpdateAndPublish(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(UpdateAndPublishDocumentTool);
