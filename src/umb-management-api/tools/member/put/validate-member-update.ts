import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import {
  putMemberByIdValidateBody,
  putMemberByIdValidateParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const ValidateMemberUpdateTool = CreateUmbracoTool(
  "validate-member-update",
  `Validates member data before updating using the Umbraco API.
  Use this endpoint to validate member data structure, properties, and business rules before attempting to update an existing member.`,
  {
    id: putMemberByIdValidateParams.shape.id,
    data: z.object(putMemberByIdValidateBody.shape),
  },
  async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMemberByIdValidate(model.id, model.data);

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

export default ValidateMemberUpdateTool;