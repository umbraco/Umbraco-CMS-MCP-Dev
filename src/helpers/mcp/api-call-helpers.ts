/**
 * API Call Helpers
 *
 * This module provides helper functions for executing API calls against the
 * Umbraco Management API with standardized error handling and response formatting.
 *
 * ## Why This Pattern Exists
 * Simple CRUD tools (80%+ of tools) need identical:
 * - Error handling (400s → ProblemDetails)
 * - Response format (structuredContent for MCP)
 * - Version checking (automatic via decorators)
 *
 * ## When to Use Helpers
 * - DELETE operations: `executeVoidApiCall`
 * - GET single item: `executeGetApiCall`
 * - GET collections/arrays: `executeGetItemsApiCall`
 * - Simple PUT/POST (no response body): `executeVoidApiCall`
 *
 * ## When to Go Manual
 * - Creating entities (need UUID generation)
 * - Response transformation (custom output)
 * - Custom status handling (e.g., 202 Accepted)
 * - Complex request building
 *
 * ## CRITICAL: Always pass CAPTURE_RAW_HTTP_RESPONSE
 * Without it, Axios throws on 400+ errors instead of returning them.
 * The helpers expect AxiosResponse, not direct data/void.
 *
 * @example Simple DELETE tool
 * ```typescript
 * handler: async ({ id }) => {
 *   return executeVoidApiCall((client) =>
 *     client.deleteDataTypeById(id, CAPTURE_RAW_HTTP_RESPONSE)
 *   );
 * }
 * ```
 *
 * @example Simple GET tool
 * ```typescript
 * handler: async ({ id }) => {
 *   return executeGetApiCall((client) =>
 *     client.getDataTypeById(id, CAPTURE_RAW_HTTP_RESPONSE)
 *   );
 * }
 * ```
 *
 * @see create-data-type.ts for manual pattern example (complex tool with UUID generation)
 */

import { AxiosResponse } from "axios";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { createToolResult } from "./tool-result.js";

/**
 * Custom error class for Umbraco API errors.
 * Contains ProblemDetails for structured error information.
 * The withErrorHandling decorator catches this and converts to tool result.
 */
export class UmbracoApiError extends Error {
  constructor(public readonly problemDetails: ProblemDetails) {
    super(problemDetails.detail || `API error: ${problemDetails.status}`);
    this.name = 'UmbracoApiError';
  }
}

/**
 * Type alias for the Umbraco Management API client instance.
 */
export type UmbracoClient = ReturnType<typeof UmbracoManagementClient.getClient>;

/**
 * Function signature for API calls that return an AxiosResponse.
 * Use with CAPTURE_RAW_HTTP_RESPONSE to get the full response object.
 */
export type ApiCallFn<T = unknown> = (client: UmbracoClient) => Promise<AxiosResponse<T>>;

/**
 * Options that configure Axios to return the raw HTTP response object instead of just the data.
 *
 * ## What This Does
 * - `returnFullResponse: true` - Makes Axios return `AxiosResponse` instead of `response.data`
 * - `validateStatus: () => true` - Prevents Axios from throwing on 400/500 status codes
 *
 * ## Why This Is Required
 * The helper functions (`executeVoidApiCall`, `executeGetApiCall`) need the full response
 * to check status codes and extract ProblemDetails on errors. Without these options:
 * - Axios throws on 400+ errors (breaking our status code handling)
 * - We only get the response body, not the status code
 *
 * ## IMPORTANT
 * You MUST pass this to every API call when using the helper functions.
 * Forgetting this option will cause silent failures or incorrect error handling.
 *
 * @example
 * ```typescript
 * // Correct - helpers receive AxiosResponse with status code
 * client.deleteDataTypeById(id, CAPTURE_RAW_HTTP_RESPONSE)
 *
 * // WRONG - helpers receive undefined/void, status checking fails
 * client.deleteDataTypeById(id)
 * ```
 */
export const CAPTURE_RAW_HTTP_RESPONSE = {
  returnFullResponse: true,
  validateStatus: () => true,
} as const;

/**
 * Options for customizing API call behavior.
 */
export interface ApiCallOptions<T = unknown> {
  /** Treat as void operation - don't include response data in result */
  void?: boolean;
  /** Custom success message to include in the response */
  successMessage?: string;
  /** Additional status codes to treat as success beyond 200-299 */
  acceptedStatusCodes?: number[];
  /** Transform the error before returning */
  transformError?: (error: ProblemDetails) => ProblemDetails;
  /** Transform success data before returning */
  transformData?: (data: T) => unknown;
}

/**
 * Validates the API response and returns it as an AxiosResponse.
 * Logs warnings if the response doesn't look like an AxiosResponse.
 * @internal
 */
function validateApiResponse<T>(
  result: unknown
): { valid: true; response: AxiosResponse<T | ProblemDetails> } | { valid: false; fallback: T | undefined } {
  if (result === undefined || result === null) {
    console.warn(
      '[MCP Tool Warning] API call returned undefined/null. ' +
      'Did you forget to pass CAPTURE_RAW_HTTP_RESPONSE to the API method?'
    );
    return { valid: false, fallback: undefined };
  }

  if (typeof result !== 'object' || !('status' in result)) {
    console.warn(
      '[MCP Tool Warning] API call did not return an AxiosResponse. ' +
      `Expected { status, data, ... } but got: ${typeof result}. ` +
      'Did you forget to pass CAPTURE_RAW_HTTP_RESPONSE to the API method?'
    );
    return { valid: false, fallback: result as T };
  }

  return { valid: true, response: result as AxiosResponse<T | ProblemDetails> };
}

/**
 * Checks if the HTTP status code indicates success.
 * @internal
 */
function isSuccessStatus(status: number, acceptedStatusCodes?: number[]): boolean {
  return (status >= 200 && status < 300) ||
    (acceptedStatusCodes?.includes(status) ?? false);
}

/**
 * Core API call executor with unified options.
 * Returns success results, throws UmbracoApiError on failures.
 * Error handling is centralized in the withErrorHandling decorator.
 * @internal
 */
async function executeApiCallInternal<T = unknown>(
  apiCall: (client: UmbracoClient) => Promise<AxiosResponse<T | ProblemDetails> | unknown>,
  options?: ApiCallOptions<T>
): Promise<CallToolResult> {
  const client = UmbracoManagementClient.getClient();
  const result = await apiCall(client);

  const validation = validateApiResponse<T>(result);

  if (!validation.valid) {
    // Fallback behavior for invalid responses
    if (options?.void) {
      return createToolResult(undefined, false);
    }
    return createToolResult(validation.fallback);
  }

  const response = validation.response;

  if (isSuccessStatus(response.status, options?.acceptedStatusCodes)) {
    // Success
    if (options?.void) {
      if (options.successMessage) {
        return createToolResult({ message: options.successMessage });
      }
      return createToolResult(undefined, false);
    }

    // GET with data
    const data = options?.transformData
      ? options.transformData(response.data as T)
      : response.data;
    return createToolResult(data);
  }

  // Error - throw for decorator to handle
  let errorData: ProblemDetails = (response.data as ProblemDetails) || {
    status: response.status,
    detail: response.statusText,
  };

  if (options?.transformError) {
    errorData = options.transformError(errorData);
  }

  throw new UmbracoApiError(errorData);
}

/**
 * Processes the HTTP response from a void operation (DELETE, PUT, POST without response body).
 *
 * ## What This Does
 * 1. Checks if status code is 200-299 (success)
 * 2. Success: Returns empty tool result (no structuredContent for void operations)
 * 3. Error: Throws UmbracoApiError for decorator to handle
 *
 * ## Usage
 * This is an internal helper used by `executeVoidApiCall`. You typically don't
 * call this directly unless building custom handlers.
 *
 * @param response - The AxiosResponse from the API call (requires CAPTURE_RAW_HTTP_RESPONSE)
 * @returns Tool result with success (empty)
 * @throws UmbracoApiError on non-2xx status codes
 */
export function processVoidResponse(
  response: AxiosResponse<ProblemDetails | void>
): CallToolResult {
  // Success status codes (200-299)
  if (response.status >= 200 && response.status < 300) {
    return createToolResult(undefined, false);
  }

  // Error status codes (400+, 500+, etc.) - throw for decorator to handle
  const errorData: ProblemDetails = response.data || {
    status: response.status,
    detail: response.statusText,
  };
  throw new UmbracoApiError(errorData);
}

/**
 * Executes a void API call (DELETE, PUT, POST without response body) and handles the response.
 *
 * ## What This Function Does
 * 1. Gets the singleton Umbraco client
 * 2. Executes your API call
 * 3. Interprets HTTP status: 200-299 = success, else = error
 * 4. Returns MCP-formatted response with ProblemDetails on error
 *
 * ## IMPORTANT: You MUST pass CAPTURE_RAW_HTTP_RESPONSE
 * Without it, Axios throws on 400+ errors instead of returning them,
 * breaking the status code handling in this function.
 *
 * @param apiCall - Function receiving the client and returning the API promise
 * @returns MCP tool result with success (empty) or ProblemDetails error
 *
 * @example
 * ```typescript
 * return executeVoidApiCall((client) =>
 *   client.deleteDataTypeById(id, CAPTURE_RAW_HTTP_RESPONSE)
 * );
 * ```
 */
export function executeVoidApiCall(
  apiCall: (client: UmbracoClient) => Promise<AxiosResponse<ProblemDetails | void> | unknown>
): Promise<CallToolResult> {
  return executeApiCallInternal(apiCall, { void: true });
}


/**
 * Executes a GET API call and handles the response.
 *
 * ## What This Function Does
 * 1. Gets the singleton Umbraco client
 * 2. Executes your API call
 * 3. Interprets HTTP status: 200-299 = success with data, else = error
 * 4. Returns MCP-formatted response with data on success, ProblemDetails on error
 *
 * ## IMPORTANT: You MUST pass CAPTURE_RAW_HTTP_RESPONSE
 * Without it, Axios throws on 400+ errors instead of returning them,
 * breaking the status code handling in this function.
 *
 * @typeParam T - The expected response data type on success
 * @param apiCall - Function receiving the client and returning the API promise
 * @returns MCP tool result with structured data on success or ProblemDetails error
 *
 * @example
 * ```typescript
 * return executeGetApiCall((client) =>
 *   client.getDataTypeById(id, CAPTURE_RAW_HTTP_RESPONSE)
 * );
 * ```
 */
export function executeGetApiCall<T = unknown>(
  apiCall: (client: UmbracoClient) => Promise<AxiosResponse<T | ProblemDetails> | unknown>
): Promise<CallToolResult> {
  return executeApiCallInternal<T>(apiCall);
}


/**
 * Options for customizing void API call behavior.
 * Subset of ApiCallOptions without void/transformData (which don't apply to void operations).
 */
export type VoidApiCallOptions = Omit<ApiCallOptions, 'void' | 'transformData'>;

/**
 * Executes a void API call with optional customization.
 *
 * Use this when you need slight customization (custom success message, extra status codes)
 * without abandoning the helper pattern entirely.
 *
 * ## When to Use This vs executeVoidApiCall
 * - Use `executeVoidApiCall` for standard DELETE/PUT/POST operations
 * - Use `executeVoidApiCallWithOptions` when you need:
 *   - Custom success message
 *   - Accept 202 or other non-2xx status codes as success
 *   - Transform errors before returning
 *
 * @param apiCall - Function receiving the client and returning the API promise
 * @param options - Optional customization options
 * @returns MCP tool result with success or ProblemDetails error
 *
 * @example Accept 202 Accepted as success
 * ```typescript
 * return executeVoidApiCallWithOptions(
 *   (client) => client.triggerAsyncOperation(id, CAPTURE_RAW_HTTP_RESPONSE),
 *   { acceptedStatusCodes: [202] }
 * );
 * ```
 *
 * @example Custom success message
 * ```typescript
 * return executeVoidApiCallWithOptions(
 *   (client) => client.deleteItem(id, CAPTURE_RAW_HTTP_RESPONSE),
 *   { successMessage: "Item successfully deleted" }
 * );
 * ```
 */
export function executeVoidApiCallWithOptions(
  apiCall: (client: UmbracoClient) => Promise<AxiosResponse<ProblemDetails | void> | unknown>,
  options?: VoidApiCallOptions
): Promise<CallToolResult> {
  return executeApiCallInternal(apiCall, { ...options, void: true });
}


/**
 * Executes a GET API call that returns a collection and wraps it as { items: T }.
 *
 * ## What This Function Does
 * 1. Gets the singleton Umbraco client
 * 2. Executes your API call
 * 3. Interprets HTTP status: 200-299 = success with data, else = error
 * 4. Wraps the response as { items: response }
 * 5. Returns MCP-formatted response
 *
 * ## When to Use This
 * Many Umbraco API endpoints return arrays or collections that need to be wrapped
 * in an { items: [...] } structure for the MCP response format. Use this helper
 * for tree operations, collection endpoints, and search results.
 *
 * ## IMPORTANT: You MUST pass CAPTURE_RAW_HTTP_RESPONSE
 * Without it, Axios throws on 400+ errors instead of returning them,
 * breaking the status code handling in this function.
 *
 * @typeParam T - The expected response data type (usually an array or collection)
 * @param apiCall - Function receiving the client and returning the API promise
 * @returns MCP tool result with { items: data } on success or ProblemDetails error
 *
 * @example Tree ancestors
 * ```typescript
 * return executeGetItemsApiCall((client) =>
 *   client.getTreeDocumentTypeAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
 * );
 * ```
 *
 * @example Search results
 * ```typescript
 * return executeGetItemsApiCall((client) =>
 *   client.getFilterDataType(params, CAPTURE_RAW_HTTP_RESPONSE)
 * );
 * ```
 */
export function executeGetItemsApiCall<T = unknown>(
  apiCall: (client: UmbracoClient) => Promise<AxiosResponse<T | ProblemDetails> | unknown>
): Promise<CallToolResult> {
  return executeApiCallInternal<T>(apiCall, {
    transformData: (data) => ({ items: data })
  });
}
