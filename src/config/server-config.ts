/**
 * Server Configuration
 *
 * This module provides a wrapper for custom configuration fields.
 * Add custom fields here when you need configuration beyond the base SDK.
 *
 * Custom fields support:
 * - string: Simple string values
 * - boolean: True/false flags
 * - csv: Comma-separated values parsed into arrays
 * - csv-path: Comma-separated paths, resolved to absolute paths
 */

import {
  getServerConfig,
  type ConfigFieldDefinition,
  type UmbracoServerConfig,
} from "@umbraco-cms/mcp-server-sdk";

// ============================================================================
// Custom Config Interface
// ============================================================================

/**
 * Custom configuration specific to this MCP server.
 * Add your own fields here - they will be parsed from CLI args or env vars.
 */
export interface CustomServerConfig {
  // Add custom fields here, e.g.:
  // experimentalFeatures?: boolean;
  // customEndpoints?: string[];
}

// ============================================================================
// Custom Field Definitions
// ============================================================================

/**
 * Define additional config fields for this server.
 * Each field automatically gets:
 * - A CLI argument (--my-field-name)
 * - An environment variable (MY_FIELD_NAME)
 * - Automatic parsing based on type
 */
const customFields: ConfigFieldDefinition[] = [
  // Add custom fields here, e.g.:
  // {
  //   name: "experimentalFeatures",
  //   envVar: "EXPERIMENTAL_FEATURES",
  //   cliFlag: "experimental-features",
  //   type: "boolean",
  // },
];

// ============================================================================
// Config Loading
// ============================================================================

export interface ServerConfig {
  /** Base Umbraco MCP configuration */
  umbraco: UmbracoServerConfig;
  /** Custom configuration for this server */
  custom: CustomServerConfig;
}

let cachedConfig: ServerConfig | null = null;

/**
 * Load server configuration from CLI arguments and environment variables.
 *
 * @param isStdioMode - Whether the server is running in stdio mode (suppresses logging)
 * @returns Combined base and custom configuration
 */
export function loadServerConfig(isStdioMode: boolean): ServerConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const { config, custom } = getServerConfig(isStdioMode, {
    additionalFields: customFields,
  });

  cachedConfig = {
    umbraco: config,
    custom: custom as CustomServerConfig,
  };

  return cachedConfig;
}

/**
 * Clear cached config (useful for testing)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}
