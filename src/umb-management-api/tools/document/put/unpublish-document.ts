import { putDocumentByIdUnpublishBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";
import {
  emptyOutputShape,
  executeVoidApiCallWithEmptyOutput,
  type EmptyOutputShape,
} from "../../shared/execute-void-with-empty-output.js";

const inputSchema = {
  id: z.string().uuid(),
  data: z.object(putDocumentByIdUnpublishBody.shape),
};

const UnpublishDocumentTool = {
  name: "unpublish-document",
  description: "Unpublishes a document by Id.",
  inputSchema: inputSchema,
  outputSchema: emptyOutputShape,
  annotations: {},
  slices: ['publish'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Unpublish),
  handler: (async (model: {
    id: string;
    data: z.infer<typeof putDocumentByIdUnpublishBody>;
  }) => {
    if (!model.data.cultures) model.data.cultures = null;
    return executeVoidApiCallWithEmptyOutput((client) =>
      client.putDocumentByIdUnpublish(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema, EmptyOutputShape>;

export default withStandardDecorators(UnpublishDocumentTool);
