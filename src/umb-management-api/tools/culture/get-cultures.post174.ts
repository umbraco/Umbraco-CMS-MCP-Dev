import { GetCultureParams } from "@/umb-management-api/schemas/index.js";
import {
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
} from "@umbraco-cms/mcp-server-sdk";

export const post174 = (params: GetCultureParams) =>
  executeGetApiCall((client) =>
    client.getCulture(params, CAPTURE_RAW_HTTP_RESPONSE),
  );
