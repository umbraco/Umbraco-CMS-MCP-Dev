import { getServerOptions, type HostedMcpServerOptions } from "@umbraco-cms/mcp-hosted";
import { checkSessionIsolation } from "@umbraco-cms/mcp-hosted/testing";
import { collections, allModes, allModeNames, allSliceNames } from "../collections.js";
import { UmbracoManagementClient } from "../umbraco-api/umbraco-management-client.js";

// Regression test for #541: one Worker isolate hosts many sessions, so a tool
// must never send one session's request to another session's site or with
// another session's token. The streaming media upload used to keep its auth in
// a module-level slot set from worker.ts init(), which a second session
// overwrote mid-call. This runs representative tools, including that upload,
// from two sessions and from sessions started mid-call, and fails on any swap.
//
// Server options mirror src/worker.ts. Its init() only calls
// createPerRequestServer, which the check does itself, so there's no `init`.
// If init() ever sets up anything per session again, mirror it in `init` here:
// the check only sees state that init() writes if it runs the same code.
const serverOptions = getServerOptions({
  name: "umbraco-cms-mcp",
  version: "0.0.0-test",
  collections,
  modeRegistry: allModes,
  allModeNames,
  allSliceNames,
  clientFactory: () => UmbracoManagementClient.getClient(),
} as HostedMcpServerOptions);

const SOURCE_HOST = "source.isolation-check.invalid";
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';

describe("hosted session isolation (#541)", () => {
  it("keeps every session's Umbraco requests on its own site and token", async () => {
    const report = await checkSessionIsolation(serverOptions as never, {
      toolCalls: [
        { name: "get-server-information" },
        { name: "get-document-root" },
        {
          name: "create-media",
          arguments: {
            sourceType: "url",
            name: "isolation-check",
            mediaTypeName: "Vector Graphics (SVG)",
            fileUrl: `https://${SOURCE_HOST}/image.svg`,
          },
        },
      ],
      // Realistic responses so create-media gets past its media-type lookup and
      // reaches the upload. With the default empty search it stops early and
      // the check would prove nothing about the upload.
      respond: (request) => {
        if (request.host === SOURCE_HOST) {
          return new Response(SVG, {
            status: 200,
            headers: { "content-type": "image/svg+xml", "content-length": String(SVG.length) },
          });
        }
        if (new URL(request.url).pathname.endsWith("/item/media-type/search")) {
          return Response.json({
            items: [{ id: "c4b1efcf-a9d5-41c4-9621-e9d273b52a9c", name: "Vector Graphics (SVG)" }],
            total: 1,
          });
        }
        return undefined;
      },
    });

    expect(report.toolsWithoutRequests).toEqual([]);
    expect(report.violations).toEqual([]);
    expect(report.ok).toBe(true);
  }, 120000);
});
