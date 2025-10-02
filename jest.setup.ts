import dotenv from 'dotenv';
import { initializeUmbracoAxios } from './src/orval/client/umbraco-axios.js';

// Load environment variables from .env
dotenv.config({ path: '.env' });

// Initialize Umbraco Axios client with environment variables
initializeUmbracoAxios({
  clientId: process.env.UMBRACO_CLIENT_ID || '',
  clientSecret: process.env.UMBRACO_CLIENT_SECRET || '',
  baseUrl: process.env.UMBRACO_BASE_URL || ''
});