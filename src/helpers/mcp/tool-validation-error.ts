/**
 * Tool Validation Error
 *
 * Custom error class for business logic validation errors in tool handlers.
 * These errors are caught by withErrorHandling and converted to ProblemDetails format.
 */

/**
 * ProblemDetails-style structure for validation errors.
 * Based on RFC 7807 Problem Details format used by Umbraco API.
 */
export interface ValidationErrorDetails {
  /** Error type identifier */
  type?: string;
  /** Human-readable title for the error type */
  title: string;
  /** HTTP status code (typically 400 for validation errors) */
  status?: number;
  /** Detailed explanation of the error */
  detail: string;
  /** Additional context-specific data (e.g., availableProperties, invalidAliases) */
  extensions?: Record<string, unknown>;
}

/**
 * Custom error for tool validation failures.
 * Thrown when business logic validation fails (e.g., invalid property aliases, missing blocks).
 * The withErrorHandling decorator recognizes this error type and formats it as ProblemDetails.
 */
export class ToolValidationError extends Error {
  public readonly details: ValidationErrorDetails;

  constructor(details: ValidationErrorDetails) {
    super(details.detail);
    this.name = "ToolValidationError";
    this.details = {
      type: details.type ?? "https://httpstatuses.com/400",
      title: details.title,
      status: details.status ?? 400,
      detail: details.detail,
      ...(details.extensions && { extensions: details.extensions }),
    };
  }

  /**
   * Converts the error to a ProblemDetails-compatible object for response.
   */
  toProblemDetails(): Record<string, unknown> {
    const { extensions, ...base } = this.details;
    return {
      ...base,
      ...(extensions ?? {}),
    };
  }
}
