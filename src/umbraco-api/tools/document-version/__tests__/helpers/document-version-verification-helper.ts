import { UmbracoManagementClient } from "@umb-management-client";
import { DocumentTestHelper } from "../../../document/__tests__/helpers/document-test-helper.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";

export class DocumentVersionVerificationHelper {
  static async findDocumentVersions(
    documentId: string,
    forSnapshot: boolean = false,
    culture?: string
  ) {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentVersion({ documentId, culture });
    // Skip Zod validation for now due to datetime format issues
    const result = response as any;

    if (forSnapshot) {
      return result.items.map((item: any) => ({
        ...item,
        id: BLANK_UUID,
      }));
    }

    return result.items;
  }

  static async getDocumentVersion(
    versionId: string,
    forSnapshot: boolean = false
  ) {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentVersionById(versionId);
    // Skip Zod validation for now due to datetime format issues
    const output = response as any;
    
    if (forSnapshot) {
      return {
        ...output,
        id: BLANK_UUID,
      };
    }
    
    return output;
  }

  static async cleanup(documentName: string): Promise<void> {
    await DocumentTestHelper.cleanup(documentName);
  }

  static normalizeIds(
    versions: any | any[]
  ): any | any[] {
    const normalizeVersion = (version: any) => ({
      ...version,
      id: BLANK_UUID,
      // Normalize dates for consistent snapshots
      ...(version.createDate && { createDate: "NORMALIZED_DATE" }),
      ...(version.publishDate && { publishDate: "NORMALIZED_DATE" }),
    });

    if (Array.isArray(versions)) {
      return versions.map(normalizeVersion);
    }
    
    return normalizeVersion(versions);
  }
}