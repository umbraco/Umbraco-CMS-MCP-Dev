import GetManifestManifestTool from "../get/get-manifest-manifest.js";
import GetManifestManifestPrivateTool from "../get/get-manifest-manifest-private.js";
import GetManifestManifestPublicTool from "../get/get-manifest-manifest-public.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

describe("manifest tools", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe("get-manifest-manifest", () => {
    it("should get all manifests", async () => {
      const result = await GetManifestManifestTool().handler({}, { signal: new AbortController().signal });

      expect(createSnapshotResult(result)).toMatchSnapshot();
    });
  });

  describe("get-manifest-manifest-private", () => {
    it("should get private manifests", async () => {
      const result = await GetManifestManifestPrivateTool().handler({}, { signal: new AbortController().signal });

      expect(createSnapshotResult(result)).toMatchSnapshot();
    });
  });

  describe("get-manifest-manifest-public", () => {
    it("should get public manifests", async () => {
      const result = await GetManifestManifestPublicTool().handler({}, { signal: new AbortController().signal });

      expect(createSnapshotResult(result)).toMatchSnapshot();
    });
  });
});