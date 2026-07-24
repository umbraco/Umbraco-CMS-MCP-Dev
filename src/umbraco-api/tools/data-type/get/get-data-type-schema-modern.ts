import { UmbracoManagementClient } from "@umb-management-client";
import { CAPTURE_RAW_HTTP_RESPONSE, type HttpResponse } from "@umbraco-cms/mcp-server-sdk";

export async function getDataTypeSchemaFromApi(
  id: string
): Promise<{ valueTypeName?: string | null; jsonSchema?: unknown }> {
  const client = UmbracoManagementClient.getClient();
  const response = (await client.getDataTypeByIdSchema(
    id,
    CAPTURE_RAW_HTTP_RESPONSE
  )) as unknown as HttpResponse;
  return response.data ?? {};
}
