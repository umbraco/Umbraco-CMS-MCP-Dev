import dotenv from 'dotenv';
import { initializeUmbracoFetch, configureApiClient } from '@umbraco-cms/mcp-server-sdk';
import { UmbracoManagementClient } from './src/umb-management-api/umbraco-management-client.js';
import { setUmbracoVersion } from './src/umb-management-api/runtime-context.js';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: '.env' });

// Prime the runtime context to mirror the production case (Umbraco ≥ 17.4).
// Collection registration unit tests rely on this so they see the new
// Schema-API tools rather than the legacy hand-rolled fallbacks. Tests that
// want to exercise the pre-17.4 branch can call setUmbracoVersion(null).
setUmbracoVersion('17.4.0');


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