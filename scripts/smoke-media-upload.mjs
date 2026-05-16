#!/usr/bin/env node
// Smoke-test driver for the media + temporary-file MCP tools.
// Spawns dist/index.js as an MCP stdio server and invokes each tool.

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const env = {
  ...process.env,
  NODE_TLS_REJECT_UNAUTHORIZED: "0",
  UMBRACO_CLIENT_ID: "umbraco-back-office-mcp",
  UMBRACO_CLIENT_SECRET: "1234567890",
  UMBRACO_BASE_URL: "http://localhost:56472",
  UMBRACO_INCLUDE_TOOL_COLLECTIONS: "media,temporary-file",
  UMBRACO_ALLOWED_MEDIA_PATHS: `/tmp,${repoRoot}`,
};

const transport = new StdioClientTransport({
  command: "node",
  args: [path.join(repoRoot, "dist/index.js")],
  env,
});

const client = new Client({ name: "smoke-driver", version: "0.0.1" });
await client.connect(transport);

async function callTool(name, args) {
  const result = await client.callTool({ name, arguments: args });
  const text = (result.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("\n");
  return { isError: !!result.isError, text };
}

function snippet(text, max = 800) {
  if (!text) return "(empty)";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function regressionCheck(text) {
  if (!text) return null;
  if (/writeFileSync/i.test(text)) return "REGRESSION: writeFileSync mentioned";
  return null;
}

function parseJsonId(text) {
  if (!text) return null;
  // Tool wraps payload — find first {…} that has an id
  const matches = text.match(/\{[\s\S]*?\}/g) ?? [];
  for (const m of matches) {
    try {
      const obj = JSON.parse(m);
      if (obj.id && typeof obj.id === "string" && /^[0-9a-fA-F-]{36}$/.test(obj.id)) {
        return obj.id;
      }
    } catch {}
  }
  return null;
}

const summary = [];
function record(label, ok, detail) {
  summary.push({ label, ok, detail });
  console.log(`\n[${ok ? "PASS" : "FAIL"}] ${label}\n  ${detail}`);
}

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

try {
  // ---------------- Test 1: create-temporary-file, no extension ---------
  console.log("\n=== Test 1: create-temporary-file (no extension) ===");
  const tempId = randomUUID();
  const t1 = await callTool("create-temporary-file", {
    id: tempId,
    fileName: "smoke_temp_noext",
    fileAsBase64: PNG_BASE64,
  });
  console.log("create:", snippet(t1.text));
  let t1Verify = "not attempted";
  if (!t1.isError) {
    const get = await callTool("get-temporary-file", { id: tempId });
    console.log("get:", snippet(get.text));
    t1Verify = get.isError ? `get isError=true` : `get ok; .png in result=${/\.png\b/i.test(get.text)}`;
  }
  let t1Cleanup = "skipped";
  try {
    const del = await callTool("delete-temporary-file", { id: tempId });
    t1Cleanup = `delete isError=${del.isError}`;
  } catch (e) {
    t1Cleanup = `delete threw: ${e.message}`;
  }
  const t1Reg = regressionCheck(t1.text);
  record(
    "create-temporary-file no-extension",
    !t1.isError && !t1Reg,
    `isError=${t1.isError}; regression=${t1Reg ?? "none"}; verify=${t1Verify}; ${t1Cleanup}`
  );

  // ---------------- helper: clean up media ------------------------------
  async function cleanupMedia(id) {
    if (!id) return "no id captured";
    try {
      const del = await callTool("delete-media", { id });
      return `delete-media isError=${del.isError}`;
    } catch (e) {
      return `delete-media threw: ${e.message}`;
    }
  }

  // ---------------- Test 2: create-media base64 ------------------------
  console.log("\n=== Test 2: create-media base64 ===");
  const t2 = await callTool("create-media", {
    sourceType: "base64",
    mediaTypeName: "Image",
    name: "_Smoke Base64 Image.png",
    fileAsBase64: PNG_BASE64,
  });
  console.log("create:", snippet(t2.text));
  const t2Id = parseJsonId(t2.text);
  let t2Verify = "skipped";
  if (!t2.isError && t2Id) {
    const get = await callTool("get-media-by-id", { id: t2Id });
    t2Verify = get.isError ? "get isError=true" : "get ok";
  }
  const t2Cleanup = await cleanupMedia(t2Id);
  const t2Reg = regressionCheck(t2.text);
  record(
    "create-media base64",
    !t2.isError && !t2Reg,
    `isError=${t2.isError}; id=${t2Id}; regression=${t2Reg ?? "none"}; verify=${t2Verify}; ${t2Cleanup}`
  );

  // ---------------- Test 3: create-media url ---------------------------
  console.log("\n=== Test 3: create-media url ===");
  const t3 = await callTool("create-media", {
    sourceType: "url",
    mediaTypeName: "Image",
    name: "_Smoke URL Image",
    fileUrl: "https://picsum.photos/200",
  });
  console.log("create:", snippet(t3.text));
  const t3Id = parseJsonId(t3.text);
  let t3Verify = "skipped";
  if (!t3.isError && t3Id) {
    const get = await callTool("get-media-by-id", { id: t3Id });
    t3Verify = get.isError ? "get isError=true" : "get ok";
  }
  const t3Cleanup = await cleanupMedia(t3Id);
  const t3Reg = regressionCheck(t3.text);
  record(
    "create-media url",
    !t3.isError && !t3Reg,
    `isError=${t3.isError}; id=${t3Id}; regression=${t3Reg ?? "none"}; verify=${t3Verify}; ${t3Cleanup}`
  );

  // ---------------- Test 4: create-media filePath ----------------------
  console.log("\n=== Test 4: create-media filePath ===");
  const t4 = await callTool("create-media", {
    sourceType: "filePath",
    mediaTypeName: "File",
    name: "_Smoke FilePath Binary",
    filePath: "/tmp/smoke.bin",
  });
  console.log("create:", snippet(t4.text));
  const t4Id = parseJsonId(t4.text);
  let t4Verify = "skipped";
  if (!t4.isError && t4Id) {
    const get = await callTool("get-media-by-id", { id: t4Id });
    t4Verify = get.isError ? "get isError=true" : "get ok";
  }
  const t4Cleanup = await cleanupMedia(t4Id);
  const t4Reg = regressionCheck(t4.text);
  record(
    "create-media filePath",
    !t4.isError && !t4Reg,
    `isError=${t4.isError}; id=${t4Id}; regression=${t4Reg ?? "none"}; verify=${t4Verify}; ${t4Cleanup}`
  );
} finally {
  console.log("\n=== SUMMARY ===");
  for (const s of summary) {
    console.log(`${s.ok ? "PASS" : "FAIL"}\t${s.label}\n\t${s.detail}`);
  }
  await client.close();
  const allOk = summary.length > 0 && summary.every((s) => s.ok);
  process.exit(allOk ? 0 : 1);
}
