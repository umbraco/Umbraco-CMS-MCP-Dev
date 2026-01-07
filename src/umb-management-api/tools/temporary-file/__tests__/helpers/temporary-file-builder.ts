import { UmbracoManagementClient } from "@umb-management-client";
import { PostTemporaryFileBody } from "@/umb-management-api/temporary-file/schemas/index.js";
import { postTemporaryFileBody } from "@/umb-management-api/temporary-file/types.zod.js";
import { ReadStream } from "fs";
import { v4 as uuidv4 } from "uuid";
import { createReadStream } from "fs";
import { join } from "path";
import { EXAMPLE_IMAGE_PATH } from "@/constants/constants.js";

export class TemporaryFileBuilder {
  private model: Partial<PostTemporaryFileBody> = {
    Id: uuidv4(),
    File: undefined,
  };
  private id: string | undefined = undefined;

  withId(id: string): TemporaryFileBuilder {
    this.model.Id = id;
    return this;
  }

  withFile(file: ReadStream): TemporaryFileBuilder {
    this.model.File = file;
    return this;
  }

  withExampleFile(): TemporaryFileBuilder {
    this.model.File = createReadStream(join(process.cwd(), EXAMPLE_IMAGE_PATH));
    return this;
  }

  async create(): Promise<TemporaryFileBuilder> {
    const client = UmbracoManagementClient.getClient();
    const validatedModel = postTemporaryFileBody.parse(this.model);
    await client.postTemporaryFile(validatedModel);
    this.id = this.model.Id;
    return this;
  }

  async verify(): Promise<boolean> {
    if (!this.id) {
      throw new Error("No temporary file has been created yet");
    }
    try {
      const client = UmbracoManagementClient.getClient();
      await client.getTemporaryFileById(this.id);
      return true;
    } catch (error) {
      return false;
    }
  }

  getId(): string {
    if (!this.id) {
      throw new Error("No temporary file has been created yet");
    }
    return this.id;
  }

  /**
   * Mark the temporary file as consumed (e.g., after avatar upload).
   * This prevents cleanup from attempting to delete it.
   */
  markConsumed(): void {
    this.id = undefined;
  }

  async cleanup(): Promise<void> {
    if (this.id) {
      try {
        const client = UmbracoManagementClient.getClient();
        await client.deleteTemporaryFileById(this.id);
      } catch (error: any) {
        // Silently ignore 404 errors - the temporary file may have already been consumed
        // (e.g., when used for avatar uploads, the file is deleted after use)
        if (error?.response?.status !== 404) {
          console.error("Error cleaning up temporary file:", error);
        }
      }
    }
  }
}
