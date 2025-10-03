import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";
import { CopyDocumentRequestModel, CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const copyDocumentSchema = z.object({
  parentId: z.string().uuid("Must be a valid document UUID of the parent node").optional(),
  idToCopy: z.string().uuid("Must be a valid document UUID that belongs to the parent document's children"),
  relateToOriginal: z.boolean().describe("Relate the copy to the original document. This is usually set to false unless specified."),
  includeDescendants: z.boolean().describe("If true, all descendant documents (children, grandchildren, etc.) will also be copied. This is usually set to false unless specified."),
});

const CopyDocumentTool = CreateUmbracoTool(
  "copy-document",
  `Copy a document to a new location. This is also the recommended way to create new documents. 
  Copy an existing document to preserve the complex JSON structure, then modify specific fields as needed.
  
  IMPORTANT WORKFLOW NOTES:
  - This function returns an empty string ("") on success, not the new document ID
  - If you need to update the copied document:
    1. After copying, search for the new document using search-document with appropriate query parameters
    2. Look for the most recent document with the target name pattern (e.g., "Original Name (1)")
    3. Use the retrieved ID for subsequent update and publish operations
  
  - If you only need to create a copy without updates:
    1. The copy is created as a draft with the naming pattern "Original Name (N)" where N is a number
    2. No further action is required if you only want to keep it as a draft copy
    3. To publish the copy as-is, you'll still need to find its ID using search-document first
  
    Example workflows:
    1. Copy only: copy-document (creates draft copy)
    2. Copy and update: copy-document → search-document → update-document → publish-document`,
    copyDocumentSchema.shape,
  async (model) => {
    const client = UmbracoManagementClient.getClient();

    const payload: CopyDocumentRequestModel = {
      target: model.parentId ? {
        id: model.parentId,
      } : undefined,
      relateToOriginal: model.relateToOriginal,
      includeDescendants: model.includeDescendants,
    };

    const response = await client.postDocumentByIdCopy(model.idToCopy, payload);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Duplicate)
);

export default CopyDocumentTool;
