import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import packageJson from "../../package.json" with { type: "json" };

export class UmbracoMcpServer {
  private static instance: McpServer | null = null;

  private constructor() {}

  public static GetServer(): McpServer {
    if (UmbracoMcpServer.instance === null) {
      UmbracoMcpServer.instance = new McpServer({
        name: "Umbraco Server",
        version: packageJson.version,
        capabilities: {
          tools: {},
        },
      });
    }
    return UmbracoMcpServer.instance;
  }
}
