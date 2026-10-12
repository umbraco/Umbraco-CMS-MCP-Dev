/**
 * Cloudflare Worker for hosted Umbraco CMS MCP.
 *
 * Wraps the CMS tool collections in a Cloudflare Worker with OAuth
 * authentication via the Umbraco backoffice.
 */

// Wrangler virtual modules
import { tracing } from "cloudflare:workers";
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
  type HostedMcpServerOptions,
  type AuthProps,
} from "@umbraco-cms/mcp-hosted";
import { umbracoCloudSiteRouting } from "@umbraco-cms/mcp-hosted/cloud";

// CMS collections and registries
import { collections, allModes, allModeNames, allSliceNames } from "./collections.js";
import { UMBRACO_TARGET_MAJOR } from "./config/umbraco-target.generated.js";
import { UmbracoManagementClient } from "./umbraco-api/umbraco-management-client.js";
import packageJson from "../package.json" with { type: "json" };

// ============================================================================
// Server Configuration
// ============================================================================

const options: HostedMcpServerOptions = {
  name: "umbraco-cms-mcp",
  version: packageJson.version,
  // Hosted counterpart of the stdio entry point's version check: when set,
  // createPerRequestServer verifies the connected Umbraco's major on every
  // request and folds a mismatch warning into that request's `instructions`.
  // `env.UMBRACO_EXPECTED_MAJOR` overrides it per-deployment, matching the
  // stdio override precedence. Unlike stdio, this never blocks a tool call —
  // createPerRequestServer has no pre-execution-hook equivalent, so a
  // mismatch here is warn-only.
  expectedUmbracoMajor: UMBRACO_TARGET_MAJOR,
  collections,
  modeRegistry: allModes,
  allModeNames,
  allSliceNames,
  enableConsentToolSelection: true,
  authOptions: { showReauthButton: true },
  clientFactory: () => UmbracoManagementClient.getClient(),
  siteRouting: umbracoCloudSiteRouting({ oauthClientId: "umbraco-cms-developer-mcp-hosted" }),
  telemetry: { tracing },
};

const serverOptions = getServerOptions(options);

// ============================================================================
// McpAgent Durable Object
// ============================================================================

export class UmbracoMcpAgent extends McpAgent<HostedMcpEnv, unknown, AuthProps> {
  server!: McpServer;

  async init() {
    // The MCP session id goes on the init span so degraded starts can be
    // traced back to their session. Telemetry only: `getSessionId()` throws
    // when the Durable Object name carries no session id, and that must not
    // stop the server from starting.
    let sessionId: string | undefined;
    try {
      sessionId = this.getSessionId?.();
    } catch (error) {
      console.warn("[mcp-hosted] could not read MCP session id for telemetry:", error);
      sessionId = undefined;
    }
    this.server = await createPerRequestServer(
      serverOptions,
      this.env,
      this.props!,
      sessionId,
    );
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
