import dotenv from 'dotenv';
import { initializeUmbracoFetch, configureApiClient } from '@umbraco-cms/mcp-server-sdk';
import { UmbracoManagementClient } from './src/umbraco-api/umbraco-management-client.js';
import { setUmbracoVersion } from './src/umbraco-api/runtime-context.js';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: '.env' });

// Prime the runtime context to mirror the production case (Umbraco ≥ 17.4).
// Collection registration unit tests rely on this so they see the new
// Schema-API tools rather than the legacy hand-rolled fallbacks. Tests that
// want to exercise the pre-17.4 branch can call setUmbracoVersion(null).
//
// To run integration/eval tests against an older live Umbraco, set the
// MCP_TEST_UMBRACO_VERSION env var (e.g. MCP_TEST_UMBRACO_VERSION=17.3.5)
// so version-gated wrappers take the legacy path instead of 404-ing on
// endpoints that don't exist yet.
setUmbracoVersion(process.env.MCP_TEST_UMBRACO_VERSION ?? '17.4.0');


// Set allowed media paths for tests (allow project root for test files)
if (!process.env.UMBRACO_ALLOWED_MEDIA_PATHS) {
  process.env.UMBRACO_ALLOWED_MEDIA_PATHS = resolve(process.cwd());
}

// Initialize Umbraco fetch client with environment variables
initializeUmbracoFetch({
  clientId: process.env.UMBRACO_CLIENT_ID || '',
  clientSecret: process.env.UMBRACO_CLIENT_SECRET || '',
  baseUrl: process.env.UMBRACO_BASE_URL || ''
});

// Configure API client for SDK helpers (executeVoidApiCall, etc.)
configureApiClient(() => UmbracoManagementClient.getClient());