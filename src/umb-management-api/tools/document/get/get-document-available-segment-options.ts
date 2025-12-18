import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentByIdAvailableSegmentOptionsParams, getDocumentByIdAvailableSegmentOptionsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const schema = z.object({
  ...getDocumentByIdAvailableSegmentOptionsParams.shape,
  ...getDocumentByIdAvailableSegmentOptionsQueryParams.shape,
});

const GetDocumentAvailableSegmentOptionsTool = {
  name: "get-document-available-segment-options",
  description: `Gets available segment options for a document by its id

  Use this to retrieve the available segment options (content variations) for a document.

  Useful for:
  • Understanding what content variations are available for a document
  • Determining which segments can be used when creating or editing document content
  • Viewing segment names, aliases, and associated cultures`,
  schema: schema.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id, skip, take }: z.infer<typeof schema>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentByIdAvailableSegmentOptions(id, { skip, take });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof schema.shape>;

export default withStandardDecorators(GetDocumentAvailableSegmentOptionsTool);
