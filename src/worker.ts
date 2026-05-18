/**
 * Cloudflare Worker for hosted Umbraco CMS MCP.
 *
 * Wraps the CMS tool collections in a Cloudflare Worker with OAuth
 * authentication via the Umbraco backoffice.
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
  createSiteRoutingApiHandler,
  getServerOptions,
  type HostedMcpEnv,
  type AuthProps,
} from "@umbraco-cms/mcp-hosted";
import { umbracoCloudSiteRouting } from "@umbraco-cms/mcp-hosted/cloud";

// CMS collections and registries
import { collections, allModes, allModeNames, allSliceNames } from "./collections.js";
import { UmbracoManagementClient } from "./umb-management-api/umbraco-management-client.js";
import { setStreamingAuthContext } from "./umb-management-api/tools/media/post/helpers/streaming-upload.js";

// ============================================================================
// Server Configuration
// ============================================================================

const options = {
  name: "umbraco-cms-mcp",
  version: "17.1.2",
  collections,
  modeRegistry: allModes,
  allModeNames,
  allSliceNames,
  enableConsentToolSelection: true,
  authOptions: { showReauthButton: true },
  clientFactory: () => UmbracoManagementClient.getClient(),
  siteRouting: umbracoCloudSiteRouting({ oauthClientId: "umbraco-cms-dev-mcp-hosted" }),
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
    // Streaming uploads bypass the orval transport for `duplex: "half"`, so
    // they need direct KV/env access. Tool handlers don't receive either.
    setStreamingAuthContext({ env: this.env, tokenKey: this.props!.umbracoTokenKey });
  }

  // Diagnostic: surface stack traces for the otherwise-opaque
  // "TypeError: Cannot read properties of undefined (reading 'some')"
  // appearing in the streamable-http handler. Override the base Agent.onError
  // so we still re-throw (to preserve framework behavior) but log first.
  // @ts-ignore — base method exists on the runtime class even though the
  // narrow McpAgent type declaration in agents-mcp.d.ts doesn't list it.
  onError(connectionOrError: unknown, error?: unknown): never {
    const theError = error ?? connectionOrError;
    const err = theError as { message?: unknown; stack?: unknown; name?: unknown } | null;
    console.log("[agent-error]", {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
    });
    throw theError as Error;
  }
}

// ============================================================================
// Worker Export
// ============================================================================

const provider = new OAuthProvider({
  apiRoute: ["/mcp", "/at/"],
  apiHandler: createSiteRoutingApiHandler(
    UmbracoMcpAgent.serve("/mcp", { binding: "MCP_AGENT" }),
  ),
  defaultHandler: createDefaultHandler(options) as any,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
});

export default createWorkerExport(provider, options);
