import dotenv from 'dotenv';
import { initializeUmbracoFetch, configureApiClient } from '@umbraco-cms/mcp-server-sdk';
import { UmbracoManagementClient } from './src/umbraco-api/umbraco-management-client.js';
import { setUmbracoVersion } from './src/umbraco-api/runtime-context.js';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: '.env' });

// Prime the runtime context with a server version so version-gated code (via
// isUmbracoAtLeast) behaves as it would against a live instance. Override with
// the MCP_TEST_UMBRACO_VERSION env var to target a different version.
setUmbracoVersion(process.env.MCP_TEST_UMBRACO_VERSION ?? '18.0.0');


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