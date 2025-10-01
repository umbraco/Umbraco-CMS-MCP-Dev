import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getDocumentByIdReferencedDescendantsParams, getDocumentByIdReferencedDescendantsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const GetDocumentByIdReferencedDescendantsTool = CreateUmbracoTool(
  "get-document-by-id-referenced-descendants",
  `Get descendant references for a document item
  Use this to find all descendant references (child items) that are being referenced for a specific document item.

  Useful for:
  • Impact analysis: Before deleting a document folder, see what content would be affected
  • Dependency tracking: Find all content using documents from a specific folder hierarchy
  • Content auditing: Identify which descendant document items are actually being used`,
  z.object({
    ...getDocumentByIdReferencedDescendantsParams.shape,
    ...getDocumentByIdReferencedDescendantsQueryParams.shape,
  }).shape,
  async ({ id, skip, take }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentByIdReferencedDescendants(id, { skip, take });
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

export default GetDocumentByIdReferencedDescendantsTool;