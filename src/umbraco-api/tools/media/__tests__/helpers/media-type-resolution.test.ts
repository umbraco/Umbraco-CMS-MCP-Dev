/**
 * Media type resolution against a site whose built-in media types don't use
 * the fresh-install keys (umbraco/Umbraco-CMS-MCP-Dev#614).
 *
 * No live Umbraco: a custom transport plays a fake site that serves
 * non-default keys and records what the tools post, so these tests prove no
 * hard-coded media type key reaches the site.
 */
import {
  clearMediaTypeIdCache,
  setCustomTransport,
  FOLDER_MEDIA_TYPE_ID,
  IMAGE_MEDIA_TYPE_ID,
  FILE_MEDIA_TYPE_ID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  getStructuredContent,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";
import CreateMediaFolderTool from "../../post/create-media-folder.js";
import CreateMediaTool from "../../post/create-media.js";
import CreateMediaMultipleTool from "../../post/create-media-multiple.js";
import {
  fetchMediaTypeId,
  uploadMediaFile,
} from "../../post/helpers/media-upload-helpers.js";
import { UmbracoManagementClient } from "@umb-management-client";

const API = "/umbraco/management/api/v1";

// Non-default keys, as on an upgraded site.
const UPGRADED_KEYS = {
  Folder: "c5ed92a2-1b3a-4d6e-9f10-2a3b4c5d6e7f",
  Image: "d1a2b3c4-0001-4e5f-8a9b-0c1d2e3f4a5b",
  File: "e2b3c4d5-0002-4f6a-9b0c-1d2e3f4a5b6c",
  Video: "f3c4d5e6-0003-4a7b-8c1d-2e3f4a5b6c7d",
  VectorGraphics: "a4d5e6f7-0004-4b8c-9d2e-3f4a5b6c7d8e",
};

type FakeMediaType = { id: string; name: string; alias: string };

const UPGRADED_SITE: FakeMediaType[] = [
  { id: UPGRADED_KEYS.Folder, name: "Folder", alias: "Folder" },
  { id: UPGRADED_KEYS.Image, name: "Image", alias: "Image" },
  { id: UPGRADED_KEYS.File, name: "File", alias: "File" },
  { id: UPGRADED_KEYS.Video, name: "Video", alias: "umbracoMediaVideo" },
  { id: UPGRADED_KEYS.VectorGraphics, name: "Vector Graphics (SVG)", alias: "umbracoMediaVectorGraphics" },
];

// A site first installed before Umbraco 8.14: no Video, Audio, Article or SVG.
const PRE_8_14_SITE: FakeMediaType[] = UPGRADED_SITE.filter((mt) =>
  ["Folder", "Image", "File"].includes(mt.alias)
);

const CREATED_MEDIA_ID = "0b1c2d3e-4f50-4617-8293-a4b5c6d7e8f9";

let postedMedia: any[] = [];

function serveSite(mediaTypes: FakeMediaType[]) {
  postedMedia = [];
  setCustomTransport((async (config: any, options: any) => {
    const { url, method, params, data } = config;

    if (method === "GET" && url === `${API}/item/media-type/search`) {
      const query = String(params?.query ?? "").toLowerCase();
      const items = mediaTypes
        .filter((mt) => mt.name.toLowerCase().includes(query))
        .map(({ id, name }) => ({ id, name }));
      return { total: items.length, items };
    }

    if (method === "GET" && url.startsWith(`${API}/media-type/`)) {
      const id = decodeURIComponent(url.slice(`${API}/media-type/`.length));
      const mediaType = mediaTypes.find((mt) => mt.id === id);
      if (!mediaType) throw Object.assign(new Error("Not found"), { response: { status: 404 } });
      return mediaType;
    }

    if (method === "GET" && url === `${API}/tree/media-type/root`) {
      const items = mediaTypes.map(({ id, name }) => ({ id, name, hasChildren: false, isFolder: false }));
      return { total: items.length, items };
    }

    if (method === "POST" && url === `${API}/temporary-file`) {
      return options?.returnFullResponse ? { status: 201, statusText: "Created", data: "" } : "";
    }

    if (method === "POST" && url === `${API}/media`) {
      postedMedia.push(data);
      const known = mediaTypes.some((mt) => mt.id === data?.mediaType?.id);
      if (!known) {
        return { status: 404, statusText: "Not Found", data: { title: "Media type not found" }, headers: {} };
      }
      return {
        status: 201,
        statusText: "Created",
        data: "",
        headers: { location: `${API}/media/${CREATED_MEDIA_ID}` },
      };
    }

    throw new Error(`Unexpected request in fake site: ${method} ${url}`);
  }) as any);
}

const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

function upload(name: string, mediaTypeName: string) {
  return uploadMediaFile(UmbracoManagementClient.getClient(), {
    sourceType: "base64",
    name,
    mediaTypeName,
    fileAsBase64: TINY_PNG_BASE64,
    temporaryFileId: "11111111-2222-4333-8444-555555555555",
  });
}

describe("media type resolution on upgraded sites", () => {
  setupTestEnvironment();

  let originalWarn: typeof console.warn;

  beforeEach(() => {
    clearMediaTypeIdCache();
    originalWarn = console.warn;
    console.warn = () => undefined;
  });

  afterEach(() => {
    console.warn = originalWarn;
    setCustomTransport(null);
    clearMediaTypeIdCache();
  });

  describe("create-media-folder", () => {
    it("posts the site's Folder id, not the fresh-install key", async () => {
      serveSite(UPGRADED_SITE);

      const result = await CreateMediaFolderTool.handler(
        { name: "Upgraded Folder" } as any,
        createMockRequestHandlerExtra()
      );

      expect(result.isError).toBeFalsy();
      expect(getStructuredContent(result)).toMatchObject({ id: CREATED_MEDIA_ID });
      expect(postedMedia).toHaveLength(1);
      expect(postedMedia[0].mediaType.id).toBe(UPGRADED_KEYS.Folder);
      expect(postedMedia[0].mediaType.id).not.toBe(FOLDER_MEDIA_TYPE_ID);
    });

    it("returns an error without posting when the site has no Folder media type", async () => {
      serveSite(UPGRADED_SITE.filter((mt) => mt.alias !== "Folder"));

      const result = await CreateMediaFolderTool.handler(
        { name: "No Folder Type" } as any,
        createMockRequestHandlerExtra()
      );

      expect(result.isError).toBe(true);
      expect(JSON.stringify(result.content)).toContain("alias 'Folder'");
      expect(postedMedia).toHaveLength(0);
    });
  });

  describe("fetchMediaTypeId", () => {
    it.each([
      ["Image", UPGRADED_KEYS.Image, IMAGE_MEDIA_TYPE_ID],
      ["image", UPGRADED_KEYS.Image, IMAGE_MEDIA_TYPE_ID],
      ["File", UPGRADED_KEYS.File, FILE_MEDIA_TYPE_ID],
    ])("resolves %s to the site's id", async (requested, expectedId, freshInstallId) => {
      serveSite(UPGRADED_SITE);

      const resolved = await fetchMediaTypeId(UmbracoManagementClient.getClient(), requested);

      expect(resolved.id).toBe(expectedId);
      expect(resolved.id).not.toBe(freshInstallId);
    });

    it("resolves SVG by its 'Vector Graphics (SVG)' name and alias", async () => {
      serveSite(UPGRADED_SITE);

      const resolved = await fetchMediaTypeId(UmbracoManagementClient.getClient(), "SVG");

      expect(resolved).toEqual({ id: UPGRADED_KEYS.VectorGraphics, name: "SVG" });
    });

    it.each(["Video", "Audio", "Article", "SVG"])(
      "falls back to File when the site has no %s media type",
      async (requested) => {
        serveSite(PRE_8_14_SITE);

        const resolved = await fetchMediaTypeId(UmbracoManagementClient.getClient(), requested);

        expect(resolved).toEqual({ id: UPGRADED_KEYS.File, name: "File" });
      }
    );

    it("throws when neither the requested type nor File exists", async () => {
      serveSite(PRE_8_14_SITE.filter((mt) => mt.alias !== "File"));

      await expect(
        fetchMediaTypeId(UmbracoManagementClient.getClient(), "Video")
      ).rejects.toThrow("no 'File' media type to fall back to");
    });
  });

  describe("uploadMediaFile", () => {
    it("uploads an image with the site's Image id and the ImageCropper value shape", async () => {
      serveSite(UPGRADED_SITE);

      const result = await upload("photo.png", "Image");

      expect(result.id).toBe(CREATED_MEDIA_ID);
      expect(result.mediaTypeName).toBe("Image");
      expect(result.substitutedFor).toBeUndefined();
      expect(postedMedia[0].mediaType.id).toBe(UPGRADED_KEYS.Image);
      expect(postedMedia[0].values[0].editorAlias).toBe("Umbraco.ImageCropper");
      expect(postedMedia[0].values[0].value).toHaveProperty("focalPoint");
    });

    it("uploads a video as File, with the File value shape, on a site without Video", async () => {
      serveSite(PRE_8_14_SITE);

      const result = await upload("clip.mp4", "Video");

      expect(result.id).toBe(CREATED_MEDIA_ID);
      expect(result.mediaTypeName).toBe("File");
      expect(result.substitutedFor).toBe("Video");
      expect(postedMedia[0].mediaType.id).toBe(UPGRADED_KEYS.File);
      expect(postedMedia[0].values[0].editorAlias).toBe("Umbraco.UploadField");
      expect(postedMedia[0].values[0].value).toEqual({
        temporaryFileId: "11111111-2222-4333-8444-555555555555",
      });
    });

    it("uploads an SVG requested as Image as Vector Graphics when the site has it", async () => {
      serveSite(UPGRADED_SITE);

      await upload("logo.svg", "Image");

      expect(postedMedia[0].mediaType.id).toBe(UPGRADED_KEYS.VectorGraphics);
      expect(postedMedia[0].values[0].editorAlias).toBe("Umbraco.UploadField");
    });

    it("uploads an SVG requested as Image as File on a site without Vector Graphics", async () => {
      serveSite(PRE_8_14_SITE);

      const result = await upload("logo.svg", "Image");

      expect(result.id).toBe(CREATED_MEDIA_ID);
      expect(postedMedia[0].mediaType.id).toBe(UPGRADED_KEYS.File);
      expect(postedMedia[0].values[0].editorAlias).toBe("Umbraco.UploadField");
      expect(postedMedia[0].values[0].value).not.toHaveProperty("focalPoint");
    });

    it("does not report a substitution for a case-only difference", async () => {
      serveSite(UPGRADED_SITE);

      const result = await upload("photo.png", "image");

      expect(result.mediaTypeName).toBe("Image");
      expect(result.substitutedFor).toBeUndefined();
    });
  });

  describe("tool results", () => {
    const base64Input = {
      sourceType: "base64",
      name: "clip.mp4",
      mediaTypeName: "Video",
      fileAsBase64: TINY_PNG_BASE64,
    };

    it("create-media says the video was created as File on a site without Video", async () => {
      serveSite(PRE_8_14_SITE);

      const result = await CreateMediaTool.handler(base64Input as any, createMockRequestHandlerExtra());

      expect(result.isError).toBeFalsy();
      expect(getStructuredContent(result)).toEqual({
        message: `Media "clip.mp4" created as 'File' — this site has no 'Video' media type.`,
        name: "clip.mp4",
        id: CREATED_MEDIA_ID,
        warning: "This site has no 'Video' media type, so 'File' was used instead.",
      });
    });

    it("create-media keeps the plain success message when Video exists", async () => {
      serveSite(UPGRADED_SITE);

      const result = await CreateMediaTool.handler(base64Input as any, createMockRequestHandlerExtra());

      expect(getStructuredContent(result)).toEqual({
        message: `Media "clip.mp4" created successfully`,
        name: "clip.mp4",
        id: CREATED_MEDIA_ID,
      });
    });

    it("create-media-multiple adds a per-file warning on a site without Video", async () => {
      serveSite(PRE_8_14_SITE);
      const realFetch = globalThis.fetch;
      globalThis.fetch = (async () => new Response("bytes")) as typeof fetch;

      try {
        const result = await CreateMediaMultipleTool.handler(
          {
            sourceType: "url",
            files: [
              { name: "clip.mp4", fileUrl: "https://files.example/clip.mp4", mediaTypeName: "Video" },
              { name: "doc.txt", fileUrl: "https://files.example/doc.txt" },
            ],
          } as any,
          createMockRequestHandlerExtra()
        );

        expect(getStructuredContent(result)).toMatchObject({
          results: [
            {
              success: true,
              name: "clip.mp4",
              id: CREATED_MEDIA_ID,
              warning: "This site has no 'Video' media type, so 'File' was used instead.",
            },
            { success: true, name: "doc.txt", id: CREATED_MEDIA_ID },
          ],
        });
        expect((getStructuredContent(result) as any).results[1]).not.toHaveProperty("warning");
      } finally {
        globalThis.fetch = realFetch;
      }
    });
  });
});
