import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CreatePartialViewRequestModel } from "@/umb-management-api/schemas/index.js";
import z from "zod";

const createPartialViewSchema = z.object({
  name: z.string().min(1, "Name is required"),
  path: z.string().optional(),
  content: z.string().min(1, "Content is required")
});

type CreatePartialViewSchema = z.infer<typeof createPartialViewSchema>;

const CreatePartialViewTool = CreateUmbracoWriteTool(
  "create-partial-view",
  "Creates a new partial view",
  createPartialViewSchema.shape,
  async (model: CreatePartialViewSchema) => {
    const client = UmbracoManagementClient.getClient();

    const normalizedPath = model.path && !model.path.startsWith('/')
      ? `/${model.path}`
      : model.path;

    const name = model.name.endsWith('.cshtml')
      ? model.name
      : `${model.name}.cshtml`;

    const content = model.content.replace(/(\r\n|\n|\r)/g, "");

    const payload: CreatePartialViewRequestModel = {
      name,
      content,
      parent: normalizedPath ? { path: normalizedPath } : undefined,
    };
    
    var response = await client.postPartialView(payload);

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

export default CreatePartialViewTool;