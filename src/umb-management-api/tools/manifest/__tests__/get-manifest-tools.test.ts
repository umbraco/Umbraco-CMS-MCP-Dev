import GetManifestManifestTool from "../get/get-manifest-manifest.js";
import GetManifestManifestPrivateTool from "../get/get-manifest-manifest-private.js";
import GetManifestManifestPublicTool from "../get/get-manifest-manifest-public.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("manifest tools", () => {
  setupTestEnvironment();

  describe("get-manifest-manifest", () => {
    it("should get all manifests", async () => {
      const result = await GetManifestManifestTool.handler({}, createMockRequestHandlerExtra());

      expect(createSnapshotResult(result)).toMatchSnapshot();
    });
  });

  describe("get-manifest-manifest-private", () => {
    it("should get private manifests", async () => {
      const result = await GetManifestManifestPrivateTool.handler({}, createMockRequestHandlerExtra());

      expect(createSnapshotResult(result)).toMatchSnapshot();
    });
  });

  describe("get-manifest-manifest-public", () => {
    it("should get public manifests", async () => {
      const result = await GetManifestManifestPublicTool.handler({}, createMockRequestHandlerExtra());

      expect(createSnapshotResult(result)).toMatchSnapshot();
    });
  });
});
