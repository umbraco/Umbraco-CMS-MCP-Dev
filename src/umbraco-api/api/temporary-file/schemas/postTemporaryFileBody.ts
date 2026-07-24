/**
 * Umbraco Management API
 * Hand-written: this endpoint is excluded from Orval generation.
 */

import { ReadStream } from "fs";

export type PostTemporaryFileBody = {
  Id: string;
  File: Buffer | ReadStream | NodeJS.ReadableStream;
  FileName: string;
};
