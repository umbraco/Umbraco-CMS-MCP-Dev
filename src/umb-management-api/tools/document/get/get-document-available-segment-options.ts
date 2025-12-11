import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getDocumentByIdAvailableSegmentOptionsParams, getDocumentByIdAvailableSegmentOptionsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const GetDocumentAvailableSegmentOptionsTool = CreateUmbracoReadTool(
  "get-document-available-segment-options",
  `Gets available segment options for a document by its id

  Use this to retrieve the available segment options (content variations) for a document.

  Useful for:
  • Understanding what content variations are available for a document
  • Determining which segments can be used when creating or editing document content
  • Viewing segment names, aliases, and associated cultures`,
  z.object({
    ...getDocumentByIdAvailableSegmentOptionsParams.shape,
    ...getDocumentByIdAvailableSegmentOptionsQueryParams.shape,
  }).shape,
  async ({ id, skip, take }) => {
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
  }
);

export default GetDocumentAvailableSegmentOptionsTool;
