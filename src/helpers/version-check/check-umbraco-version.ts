import { UmbracoManagementClient } from "@umb-management-client";
import packageJson from "../../../package.json" with { type: "json" };

type UmbracoClient = ReturnType<typeof UmbracoManagementClient.getClient>;

// Module-level variables to store version check state
let versionCheckMessage: string | null = null;
let isBlocked: boolean = false;

/**
 * Checks if the connected Umbraco instance version matches the MCP server major version.
 * Stores the result message internally for display in the first tool response.
 * Blocks tool execution on version mismatch until user acknowledges.
 * Non-blocking - never throws errors, always continues execution.
 *
 * @param client - The Umbraco Management API client
 */
export async function checkUmbracoVersion(client: UmbracoClient): Promise<void> {
  try {
    const serverInfo = await client.getServerInformation();
    const umbracoVersion = serverInfo.version; // e.g., "15.3.1" or "16.0.0"
    const mcpVersion = packageJson.version; // e.g., "16.0.0-beta.2"

    // Extract major version from both MCP version and Umbraco version
    const mcpMajor = mcpVersion.split('.')[0]; // "16.0.0-beta.2" → "16"
    const umbracoMajor = umbracoVersion.split('.')[0]; // "16.3.1" → "16"

    if (umbracoMajor === mcpMajor) {
      // Versions match - no message needed
      versionCheckMessage = null;
      isBlocked = false;
    } else {
      versionCheckMessage = `⚠️ Version Mismatch: Connected to Umbraco ${umbracoMajor}.x, but MCP server (${mcpVersion}) expects Umbraco ${mcpMajor}.x\n   This may cause compatibility issues with the Management API.`;
      isBlocked = true; // Block tool execution until user acknowledges
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    versionCheckMessage = `⚠️ Unable to verify Umbraco version compatibility: ${errorMessage}`;
    isBlocked = false; // Don't block on API errors
  }
}

/**
 * Gets the stored version check message, if any.
 * @returns The version check message or null if not set
 */
export function getVersionCheckMessage(): string | null {
  return versionCheckMessage;
}

/**
 * Clears the stored version check message and unblocks tool execution.
 * Called after the message has been displayed to the user.
 */
export function clearVersionCheckMessage(): void {
  versionCheckMessage = null;
  isBlocked = false;
}

/**
 * Checks if tool execution is currently blocked due to version mismatch.
 * @returns true if tools should be blocked, false otherwise
 */
export function isToolExecutionBlocked(): boolean {
  return isBlocked;
}
