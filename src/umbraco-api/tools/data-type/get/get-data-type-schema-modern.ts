import { UmbracoManagementClient } from "@umb-management-client";
import {
  CAPTURE_RAW_HTTP_RESPONSE,
  UmbracoApiError,
  toProblemDetails,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";

export async function getDataTypeSchemaFromApi(
  id: string
): Promise<{ valueTypeName?: string | null; jsonSchema?: unknown }> {
  const client = UmbracoManagementClient.getClient();
  const response = (await client.getDataTypeByIdSchema(
    id,
    CAPTURE_RAW_HTTP_RESPONSE
  )) as unknown as HttpResponse;
  // Non-2xx: throw like executeGetApiCall does, so withErrorHandling returns an
  // isError result carrying Umbraco's ProblemDetails instead of a "schema".
  if (typeof response?.status === "number" && (response.status < 200 || response.status >= 300)) {
    throw new UmbracoApiError(toProblemDetails(response));
  }
  return response.data ?? {};
}
