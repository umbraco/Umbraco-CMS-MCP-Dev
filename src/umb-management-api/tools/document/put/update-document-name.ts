import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import type {
  DocumentValueModel,
  DocumentVariantRequestModel,
  DocumentVariantResponseModel,
  UpdateDocumentRequestModel,
} from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  createToolResult,
  ToolValidationError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Output schema for successful responses
export const updateDocumentNameOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  previousName: z.string(),
  name: z.string(),
  culture: z.string().nullable(),
  document: z.any().describe("The updated document object"),
});

// Define the input schema
const updateDocumentNameSchema = {
  id: z.string().uuid().describe("The unique identifier of the document to rename"),
  name: z.string().min(1).describe("The new name for the document (or the document variant matching the given culture)"),
  culture: z
    .string()
    .nullish()
    .describe(
      "Optional culture code identifying which variant to rename (e.g., 'en-US'). Required when the document varies by culture and has more than one variant; omit for invariant documents."
    ),
};

type UpdateDocumentNameModel = {
  id: string;
  name: string;
  culture?: string | null;
};

function describeAvailableCultures(variants: DocumentVariantResponseModel[]) {
  return variants.map((v) => ({
    culture: v.culture ?? null,
    name: v.name,
  }));
}

const UpdateDocumentNameTool = {
  name: "update-document-name",
  description: `Renames a document (or a specific culture variant of a document) without requiring the full document JSON payload.

  A document's name lives on its variant(s), not as a property, so update-document-properties cannot change it.
  This tool performs a surgical read-modify-write: it fetches the document, updates only the name of the matching
  variant, and leaves every other variant, all property values, and the template completely untouched.

  Key features:
  - Renames the invariant variant by default, or a specific culture's variant when 'culture' is provided
  - Validates 'culture' against the document's actual variants and returns the available cultures on mismatch
  - Requires 'culture' when the document has more than one variant (culture-variant documents)
  - Never touches property values or the template - the safest way to rename a document

  Example usage:
  - Rename an invariant document: { id: "...", name: "New Name" }
  - Rename a specific culture variant: { id: "...", name: "Nyt Navn", culture: "da-DK" }`,
  inputSchema: updateDocumentNameSchema,
  outputSchema: updateDocumentNameOutputSchema.shape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Update),
  handler: (async (model: UpdateDocumentNameModel) => {
    const client = UmbracoManagementClient.getClient();

    // Step 1: Fetch the current document
    const currentDocument = await client.getDocumentById(model.id);
    const variants = currentDocument.variants;

    // Step 2: Normalize the requested culture (undefined and null both mean "invariant")
    const requestedCulture = model.culture ?? null;

    // Step 3: If no culture was given but the document has more than one variant, we can't
    // guess which one to rename - fail with a helpful list of the available cultures.
    if (requestedCulture === null && variants.length > 1) {
      throw new ToolValidationError({
        title: "Culture is required",
        detail: `This document has ${variants.length} variants, so a culture must be specified to identify which variant to rename.`,
        extensions: {
          availableCultures: describeAvailableCultures(variants),
        },
      });
    }

    // Step 4: Find the variant matching the requested culture
    const targetVariant = variants.find((v) => (v.culture ?? null) === requestedCulture);

    if (!targetVariant) {
      throw new ToolValidationError({
        title: "Invalid culture",
        detail: requestedCulture
          ? `Culture '${requestedCulture}' does not match any variant on this document.`
          : "This document has no invariant variant.",
        extensions: {
          availableCultures: describeAvailableCultures(variants),
        },
      });
    }

    const previousName = targetVariant.name;

    // Step 5: Build the variants payload, renaming only the matched variant
    const updatedVariants: DocumentVariantRequestModel[] = variants.map((v) => ({
      culture: v.culture,
      segment: v.segment,
      name: v === targetVariant ? model.name : v.name,
    }));

    // Step 6: Carry all existing values through untouched (strip readonly editorAlias)
    const values: DocumentValueModel[] = currentDocument.values.map((v) => ({
      alias: v.alias,
      culture: v.culture,
      segment: v.segment,
      value: v.value,
    }));

    // Step 7: Build the update payload - template and values are passed through unchanged
    const updatePayload: UpdateDocumentRequestModel = {
      values,
      variants: updatedVariants,
      template: currentDocument.template,
    };

    // Step 8: Submit the update
    await client.putDocumentById(model.id, updatePayload);

    // Step 9: Re-fetch the document to return the updated state
    const updatedDocument = await client.getDocumentById(model.id);

    return createToolResult({
      success: true,
      message: requestedCulture
        ? `Successfully renamed the '${requestedCulture}' variant from "${previousName}" to "${model.name}"`
        : `Successfully renamed document from "${previousName}" to "${model.name}"`,
      previousName,
      name: model.name,
      culture: requestedCulture,
      document: updatedDocument,
    });
  }),
} satisfies ToolDefinition<typeof updateDocumentNameSchema, typeof updateDocumentNameOutputSchema.shape>;

export default withStandardDecorators(UpdateDocumentNameTool);
