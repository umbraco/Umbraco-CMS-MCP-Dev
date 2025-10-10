import dotenv from 'dotenv';
import { initializeUmbracoAxios } from './src/orval/client/umbraco-axios.js';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: '.env' });

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