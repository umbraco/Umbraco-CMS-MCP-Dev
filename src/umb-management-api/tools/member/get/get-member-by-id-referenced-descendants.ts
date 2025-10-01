import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getMemberByIdReferencedDescendantsParams, getMemberByIdReferencedDescendantsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const GetMemberByIdReferencedDescendantsTool = CreateUmbracoTool(
  "get-member-by-id-referenced-descendants",
  `Get descendant references for a member
  Use this to find all descendant references that are being referenced for a specific member account.`,
  z.object({
    ...getMemberByIdReferencedDescendantsParams.shape,
    ...getMemberByIdReferencedDescendantsQueryParams.shape,
  }).shape,
  async ({ id, skip, take }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMemberByIdReferencedDescendants(id, { skip, take });
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

export default GetMemberByIdReferencedDescendantsTool;