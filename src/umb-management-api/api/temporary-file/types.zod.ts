import { ReadStream } from "fs";
import { z as zod } from "zod";

export const postTemporaryFileBody = zod.object({
  Id: zod.string().uuid(),
  File: zod.instanceof(ReadStream),
});

export const getTemporaryFileByIdParams = zod.object({
  id: zod.string().uuid(),
});

export const getTemporaryFileByIdResponse = zod.object({
  id: zod.string().guid(),
  availableUntil: zod.string().datetime({ local: true }).nullish(),
  fileName: zod.string().min(1),
});

export const deleteTemporaryFileByIdParams = zod.object({
  id: zod.string().uuid(),
});

export const getTemporaryFileConfigurationResponse = zod.object({
  imageFileTypes: zod.array(zod.string()),
  disallowedUploadedFilesExtensions: zod.array(zod.string()),
  allowedUploadedFileExtensions: zod.array(zod.string()),
  maxFileSize: zod.number().nullish(),
});
