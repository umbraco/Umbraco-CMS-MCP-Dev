import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getMemberByIdReferencedByParams, getMemberByIdReferencedByQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const GetMemberByIdReferencedByTool = CreateUmbracoReadTool(
  "get-member-by-id-referenced-by",
  `Get items that reference a specific member
  Use this to find all content, documents, or other items that are currently referencing a specific member account.`,
  z.object({
    ...getMemberByIdReferencedByParams.shape,
    ...getMemberByIdReferencedByQueryParams.shape,
  }).shape,
  async ({ id, skip, take }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMemberByIdReferencedBy(id, { skip, take });
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

export default GetMemberByIdReferencedByTool;