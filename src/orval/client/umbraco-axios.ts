import qs from "qs";
import Axios from "axios";
import https from "https";
import type { UmbracoAuthConfig } from "@umbraco-cms/mcp-server-sdk";

// Module-level variables for configuration
let authConfig: UmbracoAuthConfig | null = null;

// Initialize the client with configuration
export function initializeUmbracoAxios(config: UmbracoAuthConfig): void {
  authConfig = config;

  const { clientId, clientSecret, baseUrl } = config;

  if (!baseUrl)
    throw new Error("Missing required configuration: baseUrl");
  if (!clientId)
    throw new Error("Missing required configuration: clientId");
  if (!clientSecret && clientId !== "umbraco-swagger")
    throw new Error("Missing required configuration: clientSecret");

  // Update base URL for existing instance
  UmbracoAxios.defaults.baseURL = baseUrl;
}

const grant_type = "client_credentials";
const tokenPath = "/umbraco/management/api/v1/security/back-office/token";

// Create HTTPS agent that accepts self-signed certificates in development
// In production, enforce proper certificate validation
// In dev/test (or when NODE_ENV is not set), accept self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === "production"
});

export const UmbracoAxios = Axios.create({
  httpsAgent
});

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

// Function to fetch a new access token
const fetchAccessToken = async (): Promise<string | null> => {
  if (!authConfig) {
    throw new Error("UmbracoAxios not initialized. Call initializeUmbracoAxios first.");
  }

  const response = await Axios.post(
    `${authConfig.baseUrl}${tokenPath}`,
    {
      client_id: authConfig.clientId,
      client_secret: authConfig.clientSecret ?? "",
      grant_type,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      httpsAgent
    }
  );

  const { access_token, expires_in } = response.data;
  accessToken = access_token;
  tokenExpiry = Date.now() + expires_in * 1000; // Calculate token expiry time
  return accessToken;
};

// Axios request interceptor to add the Authorization header
UmbracoAxios.interceptors.request.use(async (config) => {
  if (!accessToken || (tokenExpiry && Date.now() >= tokenExpiry)) {
    await fetchAccessToken(); // Fetch a new token if it doesn't exist or has expired
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

UmbracoAxios.defaults.paramsSerializer = (params) =>
  qs.stringify(params, { arrayFormat: "repeat" });

/*UmbracoAxios.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});

UmbracoAxios.interceptors.response.use(response => {
  console.log('Response', response);
  return response;
});*/

/*UmbracoAxios.interceptors.request.use(request => {
  console.log('Final Request URL:', request.baseURL + request.url!);
  return request;
});*/

// Add a generic error handler to the Axios instance
UmbracoAxios.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error(
        `HTTP Error: ${error.response.status}`,
        error.response.data
      );
    } else if (error.request) {
      // Request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Error setting up request:", error.message);
    }

    // Optionally, you can throw the error to be handled by the caller
    return Promise.reject(error);
  }
);
