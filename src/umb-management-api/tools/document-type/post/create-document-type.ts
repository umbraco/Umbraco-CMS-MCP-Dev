import { UmbracoManagementClient } from "@umb-management-client";
import { ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { AxiosResponse } from "axios";
import {
  createContainerHierarchy,
} from "./helpers/create-container-hierarchy.js";

// Flattened schema - prevents LLM JSON stringification of parent object
const createDocumentTypeSchema = z.object({
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
  properties: z
    .array(
      z.object({
        name: z.string().min(1, "Property name is required"),
        alias: z.string().min(1, "Property alias is required"),
        dataTypeId: z.string().uuid("Must be a valid data type UUID"),
        tab: z.string().optional(),
        group: z.string().optional(),
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

export const createDocumentTypeOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
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
   - The tool will automatically create the container hierarchy`,
  inputSchema: createDocumentTypeSchema.shape,
  outputSchema: createDocumentTypeOutputSchema.shape,
  slices: ['create'],
  handler: (async (rawModel: CreateDocumentTypeModel) => {
    // Validate the model with the schema (including refine rules)
    const model = createDocumentTypeSchema.parse(rawModel);

    // Generate UUIDs for the document type and its components
    const documentTypeId = uuidv4();

    // Create the container hierarchy
    const { containers, containerIds } = createContainerHierarchy(
      model.properties
    );

    // Create properties with their container references
    const properties = model.properties.map((prop, index) => {
      // Determine which container to use
      let containerId: string | undefined;
      if (prop.group) {
        // Use composite key for group lookup
        const key = `${prop.tab || 'NO_TAB'}::${prop.group}`;
        containerId = containerIds.get(key);
      } else if (prop.tab) {
        containerId = containerIds.get(prop.tab);
      }

      return {
        id: uuidv4(),
        name: prop.name,
        alias: prop.alias,
        dataType: {
          id: prop.dataTypeId,
        },
        sortOrder: index,
        appearance: {
          labelOnTop: false,
        },
        validation: {
          regEx: null,
          mandatory: false,
          regExMessage: null,
          mandatoryMessage: null,
        },
        variesByCulture: false,
        variesBySegment: false,
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
      variesByCulture: false,
      variesBySegment: false,
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
    }) as unknown as AxiosResponse<ProblemDetails | void>;

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
