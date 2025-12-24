import { CopyDocumentTypeRequestModel } from "@/umb-management-api/schemas/copyDocumentTypeRequestModel.js";
import {
  postDocumentTypeByIdCopyParams,
  postDocumentTypeByIdCopyBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const copyDocumentTypeSchema = {
  id: postDocumentTypeByIdCopyParams.shape.id,
  data: z.object(postDocumentTypeByIdCopyBody.shape),
};

const CopyDocumentTypeTool = {
  name: "copy-document-type",
  description: "Copy a document type to a new location. Returns 201 Created on success.",
  inputSchema: copyDocumentTypeSchema,
  slices: ['copy'],
  handler: (async (model: { id: string; data: CopyDocumentTypeRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.postDocumentTypeByIdCopy(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof copyDocumentTypeSchema>;

export default withStandardDecorators(CopyDocumentTypeTool);
