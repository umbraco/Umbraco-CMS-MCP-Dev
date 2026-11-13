/**
 * Streaming upload (hosted worker, sourceType "url") must create the media
 * item with the media type `fetchMediaTypeId` actually resolved, not the one
 * originally requested — e.g. Video falling back to File on a site installed
 * before Umbraco 8.14 (umbraco/Umbraco-CMS-MCP-Dev#614).
 *
 * No live Umbraco: `fetchMediaTypeId` is mocked, the session auth comes from
 * the SDK's request context, raw `fetch` (source download + temporary-file
 * POST) is stubbed, and `postMedia` goes through a custom transport.
 */
import { jest } from "@jest/globals";
import {
  MEDIA_TYPE_FILE,
  MEDIA_TYPE_VIDEO,
  runWithRequestContext,
  setCustomTransport,
} from "@umbraco-cms/mcp-server-sdk";
import { setupTestEnvironment } from "@umbraco-cms/mcp-server-sdk/testing";

const actualHelpers = await import("../../post/helpers/media-upload-helpers.js");

const fetchMediaTypeIdMock = jest.fn<typeof actualHelpers.fetchMediaTypeId>();
const buildValueStructureSpy = jest.fn(actualHelpers.buildValueStructure);

jest.unstable_mockModule("../../post/helpers/media-upload-helpers.js", () => ({
  ...actualHelpers,
  fetchMediaTypeId: fetchMediaTypeIdMock,
  buildValueStructure: buildValueStructureSpy,
}));

const { streamingUploadFromUrl, streamingUploadToToolResult } = await import(
  "../../post/helpers/streaming-upload.js"
);

const API = "/umbraco/management/api/v1";
const BASE_URL = "https://umbraco.example";
const SOURCE_URL = "https://files.example/clip.mp4";
const FILE_MEDIA_TYPE_ID = "e2b3c4d5-0002-4f6a-9b0c-1d2e3f4a5b6c";
const VIDEO_MEDIA_TYPE_ID = "f3c4d5e6-0003-4a7b-8c1d-2e3f4a5b6c7d";
const CREATED_MEDIA_ID = "0b1c2d3e-4f50-4617-8293-a4b5c6d7e8f9";

const sessionContext = {
  umbracoAuth: async () => ({ baseUrl: BASE_URL, accessToken: "test-token" }),
};

let postedMedia: any[] = [];
let fetchedUrls: string[] = [];
const originalFetch = globalThis.fetch;

function upload(mediaTypeName: string) {
  return runWithRequestContext(sessionContext, () =>
    streamingUploadFromUrl({ sourceUrl: SOURCE_URL, name: "clip.mp4", mediaTypeName })
  );
}

describe("streamingUploadFromUrl media type", () => {
  setupTestEnvironment();

  beforeEach(() => {
    postedMedia = [];
    fetchedUrls = [];
    fetchMediaTypeIdMock.mockReset();
    buildValueStructureSpy.mockClear();

    globalThis.fetch = (async (input: any, init?: any) => {
      const url = String(input);
      fetchedUrls.push(url);
      if (url === SOURCE_URL) {
        return new Response("fake video bytes", { headers: { "content-type": "video/mp4" } });
      }
      if (url === `${BASE_URL}${API}/temporary-file`) {
        // Drain the multipart body so the source stream is fully read.
        await new Response(init.body).arrayBuffer();
        return new Response("", { status: 201 });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as typeof fetch;

    setCustomTransport((async (config: any) => {
      if (config.method === "POST" && config.url === `${API}/media`) {
        postedMedia.push(config.data);
        return {
          status: 201,
          statusText: "Created",
          data: "",
          headers: { location: `${API}/media/${CREATED_MEDIA_ID}` },
        };
      }
      throw new Error(`Unexpected request: ${config.method} ${config.url}`);
    }) as any);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    setCustomTransport(null);
  });

  it("creates the media with the resolved File type when Video falls back", async () => {
    fetchMediaTypeIdMock.mockResolvedValue({ id: FILE_MEDIA_TYPE_ID, name: MEDIA_TYPE_FILE });

    const result = await upload(MEDIA_TYPE_VIDEO);

    expect(fetchMediaTypeIdMock).toHaveBeenCalledWith(expect.anything(), MEDIA_TYPE_VIDEO);
    expect(fetchedUrls).toEqual([SOURCE_URL, `${BASE_URL}${API}/temporary-file`]);

    expect(buildValueStructureSpy).toHaveBeenCalledTimes(1);
    expect(buildValueStructureSpy.mock.calls[0][0]).toBe(MEDIA_TYPE_FILE);

    expect(postedMedia).toHaveLength(1);
    expect(postedMedia[0].mediaType.id).toBe(FILE_MEDIA_TYPE_ID);
    expect(postedMedia[0].values[0].editorAlias).toBe("Umbraco.UploadField");
    expect(postedMedia[0].values[0].value).not.toHaveProperty("focalPoint");

    expect(result).toEqual({
      name: "clip.mp4",
      id: CREATED_MEDIA_ID,
      mediaTypeName: MEDIA_TYPE_FILE,
      substitutedFor: MEDIA_TYPE_VIDEO,
    });
  });

  it("reports no substitution when the requested type is used", async () => {
    fetchMediaTypeIdMock.mockResolvedValue({ id: VIDEO_MEDIA_TYPE_ID, name: MEDIA_TYPE_VIDEO });

    const result = await upload("video");

    expect(postedMedia[0].mediaType.id).toBe(VIDEO_MEDIA_TYPE_ID);
    expect(buildValueStructureSpy.mock.calls[0][0]).toBe(MEDIA_TYPE_VIDEO);
    expect(result.mediaTypeName).toBe(MEDIA_TYPE_VIDEO);
    expect(result.substitutedFor).toBeUndefined();
  });

  it("surfaces the fallback in the tool result message and warning", async () => {
    fetchMediaTypeIdMock.mockResolvedValue({ id: FILE_MEDIA_TYPE_ID, name: MEDIA_TYPE_FILE });

    const toolResult = await runWithRequestContext(sessionContext, () =>
      streamingUploadToToolResult({ sourceUrl: SOURCE_URL, name: "clip.mp4", mediaTypeName: MEDIA_TYPE_VIDEO })
    );

    expect((toolResult as { isError?: boolean }).isError).toBeFalsy();
    expect(toolResult.structuredContent).toEqual({
      message: `Media "clip.mp4" created as 'File' — this site has no 'Video' media type.`,
      name: "clip.mp4",
      id: CREATED_MEDIA_ID,
      warning: "This site has no 'Video' media type, so 'File' was used instead.",
    });
  });
});
