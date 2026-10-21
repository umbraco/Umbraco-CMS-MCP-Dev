import {
  PostTemporaryFileBody,
  TemporaryFileResponseModel,
  TemporaryFileConfigurationResponseModel,
} from "./schemas/index.js";
import { UmbracoManagementClient } from "@umbraco-cms/mcp-server-sdk";
import { ReadStream } from "fs";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

// Convert a Node ReadStream to a Buffer so we can wrap it in a Blob for Web FormData.
// ReadStream is Node-only and only used by the `filePath` upload source; on Workers
// the upload source is always Buffer (from URL fetch or base64 decode).
async function readStreamToBuffer(stream: ReadStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return Buffer.concat(chunks);
}

export const getTemporaryFileAPI = () => ({
  postTemporaryFile: async (
    postTemporaryFileBody: PostTemporaryFileBody,
    options?: SecondParameter<typeof UmbracoManagementClient>
  ) => {
    // Use Web FormData (globalThis.FormData) so the request works on Cloudflare
    // Workers as well as Node stdio. The SDK mutator detects this and passes
    // straight to fetch, which sets multipart Content-Type with boundary.
    const formData = new FormData();
    formData.append("Id", postTemporaryFileBody.Id);

    const file = postTemporaryFileBody.File as Buffer | ReadStream;
    const buffer = Buffer.isBuffer(file) ? file : await readStreamToBuffer(file as ReadStream);
    // Slice into a fresh ArrayBuffer-backed Uint8Array — Blob requires
    // ArrayBufferView<ArrayBuffer>, not the wider ArrayBufferLike that Buffer uses.
    const bytes = new Uint8Array(buffer.byteLength);
    bytes.set(buffer);
    const blob = new Blob([bytes]);
    formData.append("File", blob, postTemporaryFileBody.FileName);

    return UmbracoManagementClient<void>(
      {
        url: `/umbraco/management/api/v1/temporary-file`,
        method: "POST",
        headers: options?.headers,
        data: formData,
      },
      options
    );
  },
  getTemporaryFileById: (
    id: string,
    options?: SecondParameter<typeof UmbracoManagementClient>
  ) => {
    return UmbracoManagementClient<TemporaryFileResponseModel>(
      { url: `/umbraco/management/api/v1/temporary-file/${id}`, method: "GET" },
      options
    );
  },

  deleteTemporaryFileById: (
    id: string,
    options?: SecondParameter<typeof UmbracoManagementClient>
  ) => {
    return UmbracoManagementClient<void>(
      {
        url: `/umbraco/management/api/v1/temporary-file/${id}`,
        method: "DELETE",
      },
      options
    );
  },

  getTemporaryFileConfiguration: (
    options?: SecondParameter<typeof UmbracoManagementClient>
  ) => {
    return UmbracoManagementClient<TemporaryFileConfigurationResponseModel>(
      {
        url: `/umbraco/management/api/v1/temporary-file/configuration`,
        method: "GET",
      },
      options
    );
  },
});
