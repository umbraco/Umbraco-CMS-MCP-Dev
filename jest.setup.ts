import dotenv from 'dotenv';
import { initializeUmbracoAxios, configureApiClient } from '@umbraco-cms/mcp-server-sdk';
import { UmbracoManagementClient } from './src/umb-management-api/umbraco-management-client.js';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: '.env' });

// Snapshot serializer: normalize environment-specific values
// so snapshots are consistent across local dev (macOS) and CI (Linux)
const CWD_REGEX = new RegExp(process.cwd().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
expect.addSnapshotSerializer({
  test: (val: unknown) => typeof val === 'string' && (
    CWD_REGEX.test(val) ||
    /\/(Users|home)\//.test(val) ||
    /NIOFSDirectory|MMapDirectory/.test(val) ||
    /niofsdirectory|mmapdirectory/.test(val)
  ),
  serialize: (val: string, config, indentation, depth, refs, printer) => {
    let normalized = val
      .replace(CWD_REGEX, '<CWD>')
      .replace(/\/Users\/[^\s"',)]+/g, '<NORMALIZED_PATH>')
      .replace(/\/home\/[^\s"',)]+/g, '<NORMALIZED_PATH>')
      .replace(/NIOFSDirectory|MMapDirectory/gi, 'NORMALIZED_FS_DIR');
    return printer(normalized, config, indentation, depth, refs);
  },
});

// Set allowed media paths for tests (allow project root for test files)
if (!process.env.UMBRACO_ALLOWED_MEDIA_PATHS) {
  process.env.UMBRACO_ALLOWED_MEDIA_PATHS = resolve(process.cwd());
}

// Initialize Umbraco Axios client with environment variables
initializeUmbracoAxios({
  clientId: process.env.UMBRACO_CLIENT_ID || '',
  clientSecret: process.env.UMBRACO_CLIENT_SECRET || '',
  baseUrl: process.env.UMBRACO_BASE_URL || ''
});

// Configure API client for SDK helpers (executeVoidApiCall, etc.)
configureApiClient(() => UmbracoManagementClient.getClient());