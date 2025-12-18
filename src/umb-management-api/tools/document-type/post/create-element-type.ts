import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { AxiosResponse } from "axios";
import {
  createContainerHierarchy,
  type Property,
} from "./helpers/create-container-hierarchy.js";

// Schema for creating an element type
const createElementTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  alias: z.string().min(1, "Alias is required"),
  description: z.string().optional(),
  icon: z.string().min(1, "Icon is required"),
  compositions: z
    .array(z.string().uuid("Must be a valid document type UUID"))
    .default([]),
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

type CreateElementTypeModel = z.infer<typeof createElementTypeSchema>;

const CreateElementTypeTool = {
  name: "create-element-type",
  description: `Creates a new element type in Umbraco.

IMPORTANT: IMPLEMENTATION REQUIREMENTS

1. ALWAYS use the get-icons tool to find a valid icon name
2. When referencing data types, first find them using find-data-type to get their correct IDs
3. When adding compositions, first use get-document-type-root to find the actual ID of the document type
4. The tool will automatically generate UUIDs for properties and containers
5. Always create new element types in the root before copying to a new folder if required
6. Property container structure:
   - Properties MUST specify either a 'tab' or 'group' (or both) to appear in Umbraco UI
   - Property with only tab: appears directly in the tab
   - Property with only group: appears in the group (group has no parent tab)
   - Property with both tab and group: group is nested inside the tab, property appears in the group
   - The tool will automatically create the container hierarchy`,
  schema: createElementTypeSchema.shape,
  isReadOnly: false,
  slices: ['create'],
  handler: async (rawModel: CreateElementTypeModel) => {
    // Validate the model with the schema (including refine rules)
    const model = createElementTypeSchema.parse(rawModel);

    // Generate UUIDs for the element type and its components
    const elementTypeId = uuidv4();

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

    // Create the element type payload
    const payload = {
      id: elementTypeId,
      icon: model.icon,
      name: model.name,
      alias: model.alias,
      description: model.description || "",
      cleanup: {
        preventCleanup: false,
      },
      isElement: true,
      containers,
      properties,
      compositions: model.compositions.map((id) => ({
        documentType: { id },
        compositionType: "Composition" as const,
      })),
      allowedAsRoot: false,
      variesByCulture: false,
      variesBySegment: false,
      allowedTemplates: [],
      allowedDocumentTypes: [],
    };

    const client = UmbracoManagementClient.getClient();
    const response = await client.postDocumentType(payload, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<void>;

    if (response.status === 201) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              message: "Element type created successfully",
              id: elementTypeId
            }),
          },
        ],
      };
    } else {
      // Handle error
      const errorData = response.data as any;
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              message: "Failed to create element type",
              status: response.status,
              error: errorData || response.statusText
            }),
          },
        ],
        isError: true,
      };
    }
  }
} satisfies ToolDefinition<typeof createElementTypeSchema.shape>;

export default withStandardDecorators(CreateElementTypeTool);
