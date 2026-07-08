/**
 * MCP Inspector E2E tests for Umbraco CMS hosted MCP.
 *
 * Drives the MCP Inspector UI through the full OAuth flow,
 * verifies tool listing, consent screen mode filtering,
 * readOnly toggle, and tool execution.
 *
 * Prerequisites:
 * - Umbraco CMS running at https://localhost:44391
 * - Credentials: admin@admin.com / 1234567890
 * - McpOAuthComposer registered in the Umbraco instance
 */

import { test, expect } from "@playwright/test";
import { startWorker, stopWorker } from "./helpers/worker-setup.js";
import {
  startInspector, connectInspector, handleOAuthFlow,
  getToolNames, callTool, type InspectorHandle,
} from "@umbraco-cms/mcp-hosted/testing";

// ============================================================================
// Tool lists — anchored on always-visible read-only tools
// ============================================================================

/** Server collection tools (system mode) — always visible, read-only */
const SERVER_TOOLS = [
  "get-server-information",
  "get-server-status",
  "get-server-configuration",
  "get-server-troubleshooting",
  "get-server-upgrade-check",
];

/** Language collection tools (translation mode) — always visible */
const LANGUAGE_TOOLS = [
  "get-language",
  "get-default-language",
  "get-language-by-iso-code",
  "get-language-items",
];

/** Culture collection tools (translation mode) — always visible */
const CULTURE_TOOLS = [
  "get-culture",
];

/** Document type tools (content-modeling mode) — a few reliable ones */
const CONTENT_MODELING_TOOLS = [
  "get-document-type-by-id",
  "get-all-document-types",
  "get-document-type-allowed-children",
];

/** Combined known tools for scanning */
const ALL_KNOWN_TOOLS = [
  ...SERVER_TOOLS,
  ...LANGUAGE_TOOLS,
  ...CULTURE_TOOLS,
  ...CONTENT_MODELING_TOOLS,
];

// ============================================================================
// Mode definitions
// ============================================================================

const ALL_MODES = [
  "content", "content-modeling", "front-end", "media",
  "search", "users", "members", "health",
  "translation", "system", "integrations",
];

// ============================================================================
// Tests
// ============================================================================

test.describe("CMS Hosted MCP Inspector E2E", () => {
  let workerUrl: string;
  let inspector: InspectorHandle;

  test.beforeAll(async () => {
    workerUrl = await startWorker();
    inspector = await startInspector({ client: 6314, proxy: 6317 });
  });

  test.afterAll(async () => {
    await inspector.stop();
    await stopWorker();
  });

  test.afterEach(async ({ page }) => {
    const disconnectButton = page.getByRole("button", { name: "Disconnect" });
    if (await disconnectButton.isVisible().catch(() => false)) {
      await disconnectButton.click();
    }
  });

  // --------------------------------------------------------------------------
  // 1. Connect + list tools from multiple modes
  // --------------------------------------------------------------------------

  test("connect + list system and translation tools", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["system", "translation"],
    });

    const tools = await getToolNames(page, ALL_KNOWN_TOOLS);

    // Server tools should be present (system mode)
    for (const tool of SERVER_TOOLS) {
      expect(tools, `expected server tool "${tool}"`).toContain(tool);
    }

    // Language tools should be present (translation mode)
    for (const tool of LANGUAGE_TOOLS) {
      expect(tools, `expected language tool "${tool}"`).toContain(tool);
    }

    // Content modeling tools should NOT be present (mode not selected)
    for (const tool of CONTENT_MODELING_TOOLS) {
      expect(tools, `unexpected content-modeling tool "${tool}"`).not.toContain(tool);
    }
  });

  // --------------------------------------------------------------------------
  // 2. Consent screen shows all mode checkboxes
  // --------------------------------------------------------------------------

  test("consent screen shows all 11 CMS mode checkboxes", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    const approveButton = oauthPage.locator('button[value="approve"]');
    await approveButton.waitFor();

    // Verify all mode checkboxes exist
    for (const mode of ALL_MODES) {
      const checkbox = oauthPage.locator(`.mode-checkbox[value="${mode}"]`);
      await expect(checkbox, `expected mode "${mode}" checkbox`).toBeVisible();
    }

    // All should be unchecked by default
    for (const mode of ALL_MODES) {
      const checkbox = oauthPage.locator(`.mode-checkbox[value="${mode}"]`);
      expect(await checkbox.isChecked()).toBe(false);
    }

    // Approve without changes to clean up
    await approveButton.click();
    await oauthPage.waitForURL(
      (url) => url.hostname === "localhost" && url.pathname.includes("/umbraco"),
      { timeout: 15000 },
    );
  });

  // --------------------------------------------------------------------------
  // 3. Single mode filtering — system only
  // --------------------------------------------------------------------------

  test("system mode only — only server tools, no translation tools", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["system"],
    });

    const tools = await getToolNames(page, ALL_KNOWN_TOOLS);

    // Server tools present
    for (const tool of SERVER_TOOLS) {
      expect(tools, `expected server tool "${tool}"`).toContain(tool);
    }

    // Translation tools should not be present
    for (const tool of LANGUAGE_TOOLS) {
      expect(tools, `unexpected language tool "${tool}"`).not.toContain(tool);
    }
  });

  // --------------------------------------------------------------------------
  // 4. readOnly excludes write tools
  // --------------------------------------------------------------------------

  test("readOnly toggle excludes write tools", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["system", "translation"],
      checkReadOnly: true,
    });

    const tools = await getToolNames(page, ALL_KNOWN_TOOLS);

    // Read-only server tools should still be present
    for (const tool of SERVER_TOOLS) {
      expect(tools, `read tool "${tool}" should be present`).toContain(tool);
    }

    // Read-only language tools should still be present
    for (const tool of LANGUAGE_TOOLS) {
      expect(tools, `read tool "${tool}" should be present`).toContain(tool);
    }
  });

  // --------------------------------------------------------------------------
  // 5. Execute a tool call
  // --------------------------------------------------------------------------

  test("call get-server-information — returns Umbraco version", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["system"],
    });

    const tools = await getToolNames(page, ALL_KNOWN_TOOLS);
    expect(tools).toContain("get-server-information");

    const result = await callTool(page, "get-server-information", "version");
    expect(result).toMatch(/\d+\.\d+\.\d+/);
  });

  // --------------------------------------------------------------------------
  // 6. Content-modeling mode
  // --------------------------------------------------------------------------

  test("content-modeling mode — document type tools present", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["content-modeling"],
    });

    const tools = await getToolNames(page, ALL_KNOWN_TOOLS);

    // Content modeling tools present
    for (const tool of CONTENT_MODELING_TOOLS) {
      expect(tools, `expected content-modeling tool "${tool}"`).toContain(tool);
    }

    // Server tools should not be present (system mode not selected)
    for (const tool of SERVER_TOOLS) {
      expect(tools, `unexpected server tool "${tool}"`).not.toContain(tool);
    }
  });
});
