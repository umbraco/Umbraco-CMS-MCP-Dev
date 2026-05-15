import { UmbracoManagementClient } from "@umb-management-client";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { AxiosResponse } from "axios";

export async function getDocumentTypeSchemaFromApi(id: string): Promise<{ schema: unknown }> {
  const client = UmbracoManagementClient.getClient();
  const response = (await client.getDocumentTypeByIdSchema(
    id,
    CAPTURE_RAW_HTTP_RESPONSE
  )) as unknown as AxiosResponse;
  return { schema: response.data };
}
