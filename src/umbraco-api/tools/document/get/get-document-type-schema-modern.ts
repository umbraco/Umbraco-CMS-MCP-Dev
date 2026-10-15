import { UmbracoManagementClient } from "@umb-management-client";
import {
  CAPTURE_RAW_HTTP_RESPONSE,
  UmbracoApiError,
  toProblemDetails,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";

export async function getDocumentTypeSchemaFromApi(id: string): Promise<{ schema: unknown }> {
  const client = UmbracoManagementClient.getClient();
  const response = (await client.getDocumentTypeByIdSchema(
    id,
    CAPTURE_RAW_HTTP_RESPONSE
  )) as unknown as HttpResponse;
  // Non-2xx: throw like executeGetApiCall does, so withErrorHandling returns an
  // isError result carrying Umbraco's ProblemDetails instead of a "schema".
  if (typeof response?.status !== "number") {
    // Mirrors the SDK's own validateApiResponse warning: an HttpResponse should
    // always carry a numeric status when CAPTURE_RAW_HTTP_RESPONSE is honored, so
    // this means the client/transport shape has changed under us. We can't tell
    // success from failure here, so fall through as before, but make it loud.
    console.warn(
      "[get-document-type-schema-modern] API response had no numeric status; treating as success. Did the generated client's CAPTURE_RAW_HTTP_RESPONSE wiring change?"
    );
  } else if (response.status < 200 || response.status >= 300) {
    throw new UmbracoApiError(toProblemDetails(response));
  }
  return { schema: response.data };
}
