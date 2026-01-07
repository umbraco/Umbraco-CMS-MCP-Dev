import { getServerUpgradeCheckResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetServerUpgradeCheckTool = {
  name: "get-server-upgrade-check",
  description: `Checks the server upgrade status and requirements.
  Returns an object containing:
  - type: The type of upgrade information (string)
  - comment: A description or message about the upgrade (string)
  - url: A URL with more information about the upgrade (string)

  Example response:
  {
    "type": "UpgradeAvailable",
    "comment": "A new version of Umbraco is available",
    "url": "https://our.umbraco.com/download/releases/15.3.2"
  }`,
  inputSchema: {},
  outputSchema: getServerUpgradeCheckResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['server-info'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getServerUpgradeCheck(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getServerUpgradeCheckResponse.shape>;

export default withStandardDecorators(GetServerUpgradeCheckTool);
