/**
 * Test Worker for CMS MCP E2E Tests
 *
 * Wraps the CMS tool collections in a Cloudflare Worker with OAuth
 * authentication for testing the hosted deployment path.
 */

// Wrangler virtual modules
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import OAuthProvider from "@cloudflare/workers-oauth-provider";

// Hosted MCP building blocks
import {
  createDefaultHandler,
  createWorkerExport,
  createPerRequestServer,
  getServerOptions,
  type HostedMcpEnv,
  type AuthProps,
} from "@umbraco-cms/mcp-hosted";

// CMS collections and registries
import { collections, allModes, allModeNames, allSliceNames } from "../../src/collections.js";

// ============================================================================
// Server Configuration
// ============================================================================

const options = {
  name: "umbraco-cms-mcp-e2e",
  version: "1.0.0",
  collections,
  modeRegistry: allModes,
  allModeNames,
  allSliceNames,
  enableConsentToolSelection: true,
  authOptions: { showReauthButton: true },
};

const serverOptions = getServerOptions(options);

// ============================================================================
// McpAgent Durable Object
// ============================================================================

export class UmbracoMcpAgent extends McpAgent<HostedMcpEnv, unknown, AuthProps> {
  server!: McpServer;

  async init() {
    this.server = await createPerRequestServer(
      serverOptions,
      this.env,
      this.props!,
    );
  }
}

// ============================================================================
// Worker Export
// ============================================================================

const provider = new OAuthProvider({
  apiRoute: "/mcp",
  apiHandler: UmbracoMcpAgent.serve("/mcp", { binding: "MCP_AGENT" }),
  defaultHandler: createDefaultHandler(options) as any,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
});

export default createWorkerExport(provider, options);
