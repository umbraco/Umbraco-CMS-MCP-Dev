import { putDocumentByIdUnpublishBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const inputSchema = {
  id: z.string().uuid(),
  data: z.object(putDocumentByIdUnpublishBody.shape),
};

const UnpublishDocumentTool = {
  name: "unpublish-document",
  description: "Unpublishes a document by Id.",
  inputSchema: inputSchema,
  annotations: {},
  slices: ['publish'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Unpublish),
  handler: (async (model: {
    id: string;
    data: z.infer<typeof putDocumentByIdUnpublishBody>;
  }) => {
    if (!model.data.cultures) model.data.cultures = null;
    return executeVoidApiCall((client) =>
      client.putDocumentByIdUnpublish(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(UnpublishDocumentTool);
