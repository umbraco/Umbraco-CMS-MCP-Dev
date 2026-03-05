/**
 * Cloudflare Worker Entry Point
 *
 * Hosted MCP server deployment for Cloudflare Workers.
 * Uses the same tool collections as the stdio entry point (index.ts)
 * but runs over Streamable HTTP with OAuth authentication.
 *
 * NOTE: This file is built by wrangler (not tsup) because it uses
 * Wrangler virtual modules (`agents/mcp`, `@cloudflare/workers-oauth-provider`).
 *
 * Deployment:
 *   npx wrangler dev     # Local development
 *   npx wrangler deploy  # Production deployment
 *
 * See wrangler.toml for configuration.
 */

// Wrangler virtual modules (resolved at wrangler build time)
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import OAuthProvider from "@cloudflare/workers-oauth-provider";

// Hosted MCP building blocks
import {
  createDefaultHandler,
  createPerRequestServer,
  getServerOptions,
  type HostedMcpEnv,
  type AuthProps,
} from "@umbraco-cms/mcp-hosted";

// All tool collections (same as stdio mode)
import { availableCollections } from "./umb-management-api/tools/collection-registry.js";

// Orval-generated API client (provides named methods like getTreeDataTypeRoot)
import { UmbracoManagementClient } from "./umb-management-api/umbraco-management-client.js";

// Config registries for tool filtering (same as stdio mode)
import { allModes, allModeNames, allSliceNames } from "./config/index.js";

// ============================================================================
// Multi-Site Configuration (uncomment to enable)
// ============================================================================

// const multiSite: MultiSiteConfig = {
//   sites: [
//     {
//       id: "prod",
//       displayName: "Production",
//       baseUrl: "https://prod.example.com",
//       oauthClientId: "umbraco-back-office-mcp",
//     },
//     {
//       id: "staging",
//       displayName: "Staging",
//       baseUrl: "https://staging.example.com",
//       oauthClientId: "umbraco-back-office-mcp",
//       readOnly: "true",
//     },
//   ],
// };

// ============================================================================
// Server Configuration
// ============================================================================

const options = {
  name: "umbraco-cms-developer-mcp",
  version: "1.0.0",
  collections: availableCollections,
  modeRegistry: allModes,
  allModeNames,
  allSliceNames,
  // Provide the Orval-generated client so tool handlers get named methods
  // (e.g., client.getTreeDataTypeRoot()) via configureApiClient().
  // The underlying transport is automatically set to fetch by createPerRequestServer.
  clientFactory: () => UmbracoManagementClient.getClient(),
  // Uncomment to enable multi-site:
  // multiSite,
};

const serverOptions = getServerOptions(options);

// ============================================================================
// McpAgent Durable Object
// ============================================================================

/**
 * Durable Object class for stateful MCP sessions.
 * Each MCP client connection gets its own instance.
 * Wrangler resolves `McpAgent` from the `agents/mcp` virtual module.
 */
export class UmbracoMcpAgent extends McpAgent<HostedMcpEnv, unknown, AuthProps> {
  server!: McpServer;
  // env is available at runtime via Durable Object context but not declared in agents types
  declare env: HostedMcpEnv;

  async init() {
    this.server = await createPerRequestServer(
      serverOptions,
      this.env,
      this.props!
    );
  }
}

// ============================================================================
// Worker Export
// ============================================================================

/**
 * Main Worker fetch handler wrapped with OAuthProvider.
 *
 * OAuthProvider (from `@cloudflare/workers-oauth-provider`) handles:
 * - /.well-known/oauth-authorization-server (metadata discovery)
 * - /authorize (authorization endpoint — delegated to defaultHandler)
 * - /token (token endpoint)
 * - /register (dynamic client registration - RFC 7591)
 * - /mcp (MCP protocol via Streamable HTTP, authenticated)
 */
export default new OAuthProvider({
  apiRoute: "/mcp",
  apiHandler: UmbracoMcpAgent.serve("/mcp", { binding: "MCP_AGENT" }),
  defaultHandler: createDefaultHandler(options),
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
});
