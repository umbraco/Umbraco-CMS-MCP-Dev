import { UmbracoManagementClient } from "@umb-management-client";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { AxiosResponse } from "axios";

export async function getDataTypeSchemaFromApi(
  id: string
): Promise<{ valueTypeName?: string | null; jsonSchema?: unknown }> {
  const client = UmbracoManagementClient.getClient();
  const response = (await client.getDataTypeByIdSchema(
    id,
    CAPTURE_RAW_HTTP_RESPONSE
  )) as unknown as AxiosResponse;
  return response.data ?? {};
}
