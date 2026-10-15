import { UmbracoManagementClient } from "@umb-management-client";
import { ProblemDetails } from "@/umbraco-api/schemas/index.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  createContainerHierarchy,
} from "./helpers/create-container-hierarchy.js";
import {
  type ToolDefinition,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";

// Flattened schema - prevents LLM JSON stringification of parent object
// Exported for tests that need to exercise the MCP SDK's own schema.parse
// (and its defaults) ahead of calling the handler directly.
export const createDocumentTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  alias: z.string().min(1, "Alias is required"),
  description: z.string().optional(),
  icon: z.string().min(1, "Icon is required"),
  allowedAsRoot: z.boolean().default(false),
  parentId: z.string().uuid().optional(),
  compositions: z
    .array(z.string().uuid("Must be a valid document type UUID"))
    .default([]),
  allowedDocumentTypes: z
    .array(z.string().uuid("Must be a valid document type UUID"))
    .default([]),
  collection: z
    .string()
    .uuid("Must be a valid collection data type UUID")
    .optional(),
  variesByCulture: z.boolean().default(false),
  variesBySegment: z.boolean().default(false),
  properties: z
    .array(
      z.object({
        name: z.string().min(1, "Property name is required"),
        alias: z.string().min(1, "Property alias is required"),
        dataTypeId: z.string().uuid("Must be a valid data type UUID"),
        tab: z.string().optional(),
        group: z.string().optional(),
        description: z.string().optional(),
        mandatory: z.boolean().optional(),
        sortOrder: z.number().int().nonnegative().max(2147483647).optional(),
        variesByCulture: z.boolean().optional(),
        variesBySegment: z.boolean().optional(),
      }).refine(
        (data) => data.tab || data.group,
        {
          message: "Property must specify either 'tab' or 'group' (or both) to appear in Umbraco UI. Properties without a container are invisible.",
          path: ["tab"]
        }
      )
    )
    .default([]),
});

type CreateDocumentTypeModel = z.infer<typeof createDocumentTypeSchema>;

export type { CreateDocumentTypeModel };

// Umbraco's ContentTypeEditingServiceBase.ValidateAsync performs no cross-field
// reconciliation between a document type's own variation flags and its properties'
// flags - MapProperty calls SetVariesBy unconditionally and will silently persist
// an inconsistent combination (e.g. a segment-varying property on a document type
// that itself doesn't vary by segment, or a type-level flag with no varying
// property at all). We enforce the consistency Umbraco doesn't, rejecting the
// mismatch up front instead of letting it succeed as an unusable configuration.
//
// Kept separate from `createDocumentTypeSchema` (used for `inputSchema.shape`)
// because `.superRefine()` returns a `ZodEffects`, which has no `.shape`.
const createDocumentTypeValidatedSchema = createDocumentTypeSchema.superRefine(
  (data, ctx) => {
    const checkVariation = (
      typeLevelFlag: boolean,
      propFlagKey: "variesByCulture" | "variesBySegment"
    ) => {
      const varyingPropertyIndexes = data.properties
        .map((prop, index) => (prop[propFlagKey] ? index : -1))
        .filter((index) => index !== -1);

      if (!typeLevelFlag && varyingPropertyIndexes.length > 0) {
        for (const index of varyingPropertyIndexes) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["properties", index, propFlagKey],
            message: `Property at index ${index} has '${propFlagKey}: true', but the document type's own '${propFlagKey}' is false. Umbraco does not reconcile this - it silently persists the mismatch and the property's variation never takes effect. Set '${propFlagKey}: true' at the document type level, or remove it from this property.`,
          });
        }
      }

      if (typeLevelFlag && varyingPropertyIndexes.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [propFlagKey],
          message: `'${propFlagKey}' is true at the document type level, but no property has '${propFlagKey}: true'. This creates a document type that claims to vary but has nothing that actually varies - a dead-end configuration Umbraco will accept without complaint. Set '${propFlagKey}: true' on at least one property, or set '${propFlagKey}: false' at the document type level.`,
        });
      }
    };

    checkVariation(data.variesByCulture, "variesByCulture");
    checkVariation(data.variesBySegment, "variesBySegment");
  }
);

export const createDocumentTypeOutputSchema = z.object({
  message: z.string(),
  id: z.string().guid()
});

const CreateDocumentTypeTool = {
  name: "create-document-type",
  description: `Creates a new document type in Umbraco.

IMPORTANT: IMPLEMENTATION REQUIREMENTS

1. ALWAYS use the get-icons tool to find a valid icon name
2. When referencing data types, first find them using find-data-type to get their correct IDs
3. When adding compositions or allowed document types, first use get-document-type-root to find the actual IDs
4. The tool will automatically generate UUIDs for properties and containers
5. Document types can be created in folders by specifying a parentId, or at the root level by omitting the parentId
6. Do not try to add templates to document types they are not currently supported
7. Property container structure:
   - Properties MUST specify either a 'tab' or 'group' (or both) to appear in Umbraco UI
   - Property with only tab: appears directly in the tab
   - Property with only group: appears in the group (group has no parent tab)
   - Property with both tab and group: group is nested inside the tab, property appears in the group
   - The tool will automatically create the container hierarchy
8. Properties optionally accept 'description', 'mandatory' and 'sortOrder':
   - 'description' sets the property's help text (defaults to none)
   - 'mandatory' marks the property as required (defaults to false)
   - 'sortOrder' controls the property's position (defaults to the next position not already claimed by another property's explicit sortOrder)
9. 'variesByCulture' and 'variesBySegment' control content variation (both default to false):
   - The document type level flag and the property level flags must agree, and this tool enforces it before calling Umbraco: setting the document type level flag to true requires at least one property with the matching flag true, and a property with a flag true requires the matching document type level flag to be true. A mismatch is rejected up front with a validation error naming the offending property.
   - This check exists because Umbraco itself does NOT reconcile the two levels - it will silently persist an inconsistent combination (e.g. a segment-varying property on a type that doesn't vary by segment) rather than rejecting or clamping it, leaving a document type that looks created successfully but has unusable variation.
   - 'variesByCulture' enables language/culture variation (requires multiple languages to be configured)
   - 'variesBySegment' enables segment variation (e.g. for A/B testing or audience targeting)`,
  inputSchema: createDocumentTypeSchema.shape,
  outputSchema: createDocumentTypeOutputSchema.shape,
  slices: ['create'],
  handler: (async (rawModel: CreateDocumentTypeModel) => {
    // Validate the model with the schema (including refine/superRefine rules,
    // such as the cross-field variation consistency check above)
    const model = createDocumentTypeValidatedSchema.parse(rawModel);

    // Generate UUIDs for the document type and its components
    const documentTypeId = uuidv4();

    // Create the container hierarchy
    const { containers, containerIds } = createContainerHierarchy(
      model.properties
    );

    // Properties without an explicit sortOrder fall back to their position in the
    // array, skipping any position already claimed by another property's explicit
    // sortOrder - otherwise an explicit value can silently collide with a fallback.
    const explicitSortOrders = new Set(
      model.properties
        .map((prop) => prop.sortOrder)
        .filter((sortOrder): sortOrder is number => sortOrder !== undefined)
    );
    let nextSortOrder = 0;

    // Create properties with their container references
    const properties = model.properties.map((prop) => {
      // Determine which container to use
      let containerId: string | undefined;
      if (prop.group) {
        // Use composite key for group lookup
        const key = `${prop.tab || 'NO_TAB'}::${prop.group}`;
        containerId = containerIds.get(key);
      } else if (prop.tab) {
        containerId = containerIds.get(prop.tab);
      }

      let sortOrder = prop.sortOrder;
      if (sortOrder === undefined) {
        while (explicitSortOrders.has(nextSortOrder)) {
          nextSortOrder++;
        }
        sortOrder = nextSortOrder;
        nextSortOrder++;
      }

      return {
        id: uuidv4(),
        name: prop.name,
        alias: prop.alias,
        description: prop.description ?? null,
        dataType: {
          id: prop.dataTypeId,
        },
        sortOrder,
        appearance: {
          labelOnTop: false,
        },
        validation: {
          regEx: null,
          mandatory: prop.mandatory ?? false,
          regExMessage: null,
          mandatoryMessage: null,
        },
        variesByCulture: prop.variesByCulture ?? false,
        variesBySegment: prop.variesBySegment ?? false,
        container: containerId ? { id: containerId } : undefined,
      };
    });

    // Create the document type payload
    const payload = {
      id: documentTypeId,
      icon: model.icon,
      name: model.name,
      alias: model.alias,
      description: model.description || "",
      cleanup: {
        preventCleanup: false,
      },
      isElement: false,
      containers,
      properties,
      compositions: model.compositions.map((id) => ({
        documentType: { id },
        compositionType: "Composition" as const,
      })),
      allowedAsRoot: model.allowedAsRoot,
      allowedInLibrary: true,
      variesByCulture: model.variesByCulture,
      variesBySegment: model.variesBySegment,
      allowedTemplates: [],
      allowedDocumentTypes: model.allowedDocumentTypes.map((id, index) => ({
        documentType: { id },
        sortOrder: index,
      })),
      collection: model.collection ? { id: model.collection } : undefined,
      parent: model.parentId ? { id: model.parentId } : undefined,
    };

    const client = UmbracoManagementClient.getClient();
    const response = await client.postDocumentType(payload, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as HttpResponse<ProblemDetails | void>;

    if (response.status === 201) {
      const output = {
        message: "Document type created successfully",
        id: documentTypeId
      };
      return createToolResult(output);
    } else {
      // Handle error - Umbraco API returns ProblemDetails as structured data
      const errorData: ProblemDetails = response.data || {
        status: response.status,
        detail: response.statusText,
      };
      return createToolResultError(errorData);
    }
  }),
} satisfies ToolDefinition<typeof createDocumentTypeSchema.shape, typeof createDocumentTypeOutputSchema.shape>;

export default withStandardDecorators(CreateDocumentTypeTool);
