import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { getDataTypeByIdIsUsedParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  createToolResult,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  isUsed: z.boolean().describe("Whether the data type is currently used within Umbraco"),
}).shape;

const IsUsedDataTypeTool = {
  name: "is-used-data-type",
  description: "Checks if a data type is used within Umbraco",
  inputSchema: getDataTypeByIdIsUsedParams.shape,
  outputSchema,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['references'],
  handler: (async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const isUsed = await client.getDataTypeByIdIsUsed(id);
    return createToolResult({ isUsed });
  }),
} satisfies ToolDefinition<typeof getDataTypeByIdIsUsedParams.shape, typeof outputSchema>;

export default withStandardDecorators(IsUsedDataTypeTool);
