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
 * - GET operations: `executeGetApiCall`
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
import { ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { createToolResult, createToolResultError } from "./tool-result.js";

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
 * @deprecated Use CAPTURE_RAW_HTTP_RESPONSE instead
 */
export const FULL_RESPONSE_OPTIONS = CAPTURE_RAW_HTTP_RESPONSE;

/**
 * Processes the HTTP response from a void operation (DELETE, PUT, POST without response body).
 *
 * ## What This Does
 * 1. Checks if status code is 200-299 (success)
 * 2. Success: Returns empty tool result (no structuredContent for void operations)
 * 3. Error: Extracts ProblemDetails from response body and returns as error
 *
 * ## Usage
 * This is an internal helper used by `executeVoidApiCall`. You typically don't
 * call this directly unless building custom handlers.
 *
 * @param response - The AxiosResponse from the API call (requires CAPTURE_RAW_HTTP_RESPONSE)
 * @returns Tool result with success (empty) or error (ProblemDetails)
 */
export function processVoidResponse(
  response: AxiosResponse<ProblemDetails | void>
): {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: { [x: string]: unknown };
  isError?: boolean;
} {
  // Success status codes (200-299)
  if (response.status >= 200 && response.status < 300) {
    return createToolResult(
      undefined,  // No structuredContent for void responses
      false,      // isError
      false       // includeStructured - No outputSchema, so exclude structuredContent to reduce token usage
    );
  }

  // Error status codes (400+, 500+, etc.) - all returned as structured ProblemDetails
  const errorData: ProblemDetails = response.data || {
    status: response.status,
    detail: response.statusText,
  };
  return createToolResultError(errorData);
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
 * ## Runtime Validation
 * This function logs a warning if the API call doesn't return an AxiosResponse,
 * which usually indicates CAPTURE_RAW_HTTP_RESPONSE was forgotten.
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
export async function executeVoidApiCall(
  apiCall: (client: ReturnType<typeof UmbracoManagementClient.getClient>) => Promise<any>
): Promise<{
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: { [x: string]: unknown };
  isError?: boolean;
}> {
  const client = UmbracoManagementClient.getClient();
  const result = await apiCall(client);

  // Runtime validation: Check if result looks like an AxiosResponse
  // If not, CAPTURE_RAW_HTTP_RESPONSE was likely forgotten
  if (result === undefined || result === null) {
    console.warn(
      '[MCP Tool Warning] API call returned undefined/null. ' +
      'Did you forget to pass CAPTURE_RAW_HTTP_RESPONSE to the API method?'
    );
    return createToolResult(undefined, false, false);
  }

  if (typeof result !== 'object' || !('status' in result)) {
    console.warn(
      '[MCP Tool Warning] API call did not return an AxiosResponse. ' +
      `Expected { status, data, ... } but got: ${typeof result}. ` +
      'Did you forget to pass CAPTURE_RAW_HTTP_RESPONSE to the API method?'
    );
    // Attempt to handle as success (legacy behavior)
    return createToolResult(undefined, false, false);
  }

  const response = result as AxiosResponse<ProblemDetails | void>;
  return processVoidResponse(response);
}

/**
 * @deprecated Use executeVoidApiCall instead
 */
export const executeVoidOperation = executeVoidApiCall;

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
 * ## Runtime Validation
 * This function logs a warning if the API call doesn't return an AxiosResponse,
 * which usually indicates CAPTURE_RAW_HTTP_RESPONSE was forgotten.
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
export async function executeGetApiCall<T = unknown>(
  apiCall: (client: ReturnType<typeof UmbracoManagementClient.getClient>) => Promise<any>
): Promise<{
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: { [x: string]: unknown };
  isError?: boolean;
}> {
  const client = UmbracoManagementClient.getClient();
  const result = await apiCall(client);

  // Runtime validation: Check if result looks like an AxiosResponse
  // If not, CAPTURE_RAW_HTTP_RESPONSE was likely forgotten
  if (result === undefined || result === null) {
    console.warn(
      '[MCP Tool Warning] API call returned undefined/null. ' +
      'Did you forget to pass CAPTURE_RAW_HTTP_RESPONSE to the API method?'
    );
    return createToolResult(undefined);
  }

  if (typeof result !== 'object' || !('status' in result)) {
    console.warn(
      '[MCP Tool Warning] API call did not return an AxiosResponse. ' +
      `Expected { status, data, ... } but got: ${typeof result}. ` +
      'Did you forget to pass CAPTURE_RAW_HTTP_RESPONSE to the API method? ' +
      'Attempting to use result as data directly (legacy fallback).'
    );
    // Fallback: assume result is the data directly (legacy behavior without options)
    return createToolResult(result as T);
  }

  const response = result as AxiosResponse<T | ProblemDetails>;

  // Check for success status codes (200-299)
  if (response.status >= 200 && response.status < 300) {
    // Success - return structured data
    return createToolResult(response.data as T);
  } else {
    // Error - return structured ProblemDetails
    const errorData: ProblemDetails = response.data || {
      status: response.status,
      detail: response.statusText,
    };
    return createToolResultError(errorData);
  }
}

/**
 * @deprecated Use executeGetApiCall instead
 */
export const executeGetOperation = executeGetApiCall;

/**
 * @deprecated Use processVoidResponse instead
 */
export const handleVoidOperation = processVoidResponse;

/**
 * Options for customizing void API call behavior.
 *
 * Use with `executeVoidApiCallWithOptions` when you need slight customization
 * without abandoning the helper pattern entirely.
 */
export interface VoidApiCallOptions {
  /**
   * Custom success message to include in the response.
   * Default: no message (empty content for void operations)
   */
  successMessage?: string;

  /**
   * Additional status codes to treat as success beyond 200-299.
   * Useful for endpoints that return 202 Accepted for async operations.
   * Default: only 200-299 are treated as success
   */
  acceptedStatusCodes?: number[];

  /**
   * Transform the error before returning.
   * Useful for adding context or modifying the ProblemDetails.
   * @param error - The original ProblemDetails from the API
   * @returns Modified ProblemDetails to return
   */
  transformError?: (error: ProblemDetails) => ProblemDetails;
}

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
export async function executeVoidApiCallWithOptions(
  apiCall: (client: ReturnType<typeof UmbracoManagementClient.getClient>) => Promise<any>,
  options?: VoidApiCallOptions
): Promise<{
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: { [x: string]: unknown };
  isError?: boolean;
}> {
  const client = UmbracoManagementClient.getClient();
  const result = await apiCall(client);

  // Runtime validation (same as executeVoidApiCall)
  if (result === undefined || result === null) {
    console.warn(
      '[MCP Tool Warning] API call returned undefined/null. ' +
      'Did you forget to pass CAPTURE_RAW_HTTP_RESPONSE to the API method?'
    );
    return createToolResult(undefined, false, false);
  }

  if (typeof result !== 'object' || !('status' in result)) {
    console.warn(
      '[MCP Tool Warning] API call did not return an AxiosResponse. ' +
      `Expected { status, data, ... } but got: ${typeof result}. ` +
      'Did you forget to pass CAPTURE_RAW_HTTP_RESPONSE to the API method?'
    );
    return createToolResult(undefined, false, false);
  }

  const response = result as AxiosResponse<ProblemDetails | void>;

  // Check for success status codes
  const isSuccess =
    (response.status >= 200 && response.status < 300) ||
    (options?.acceptedStatusCodes?.includes(response.status) ?? false);

  if (isSuccess) {
    // Success - return with optional message
    if (options?.successMessage) {
      return createToolResult(
        { message: options.successMessage },
        false,
        true
      );
    }
    return createToolResult(undefined, false, false);
  }

  // Error - extract and optionally transform ProblemDetails
  let errorData: ProblemDetails = response.data || {
    status: response.status,
    detail: response.statusText,
  };

  if (options?.transformError) {
    errorData = options.transformError(errorData);
  }

  return createToolResultError(errorData);
}
