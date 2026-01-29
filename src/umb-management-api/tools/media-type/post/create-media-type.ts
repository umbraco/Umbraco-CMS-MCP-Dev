import { UmbracoManagementClient } from "@umb-management-client";
import { CreateMediaTypeRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { postMediaTypeBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { AxiosResponse } from "axios";
import {
  type ToolDefinition,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Extract the property and container schemas from the generated schema
const propertySchema = postMediaTypeBody.shape.properties;
const containerSchema = postMediaTypeBody.shape.containers;
const allowedMediaTypeSchema = postMediaTypeBody.shape.allowedMediaTypes;
const compositionSchema = postMediaTypeBody.shape.compositions;
const collectionSchema = postMediaTypeBody.shape.collection;

// Flattened schema - prevents LLM JSON stringification of parent object
const createMediaTypeSchema = z.object({
  alias: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullish(),
  icon: z.string().min(1),
  allowedAsRoot: z.boolean(),
  variesByCulture: z.boolean(),
  variesBySegment: z.boolean(),
  isElement: z.boolean(),
  properties: propertySchema,
  containers: containerSchema,
  id: z.string().uuid().nullish(),
  parentId: z.string().uuid().optional(),  // Flattened parent ID
  allowedMediaTypes: allowedMediaTypeSchema,
  compositions: compositionSchema,
  collection: collectionSchema
});

type CreateMediaTypeSchema = z.infer<typeof createMediaTypeSchema>;

export const createMediaTypeOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

const CreateMediaTypeTool = {
  name: "create-media-type",
  description: "Creates a new media type",
  inputSchema: createMediaTypeSchema.shape,
  outputSchema: createMediaTypeOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreateMediaTypeSchema) => {
    const client = UmbracoManagementClient.getClient();

    // Transform: flat parentId -> nested parent object for API
    const payload: CreateMediaTypeRequestModel = {
      alias: model.alias,
      name: model.name,
      description: model.description,
      icon: model.icon,
      allowedAsRoot: model.allowedAsRoot,
      variesByCulture: model.variesByCulture,
      variesBySegment: model.variesBySegment,
      isElement: model.isElement,
      properties: model.properties,
      containers: model.containers,
      id: model.id,
      parent: model.parentId ? { id: model.parentId } : undefined,
      allowedMediaTypes: model.allowedMediaTypes,
      compositions: model.compositions,
      collection: model.collection
    };

    const response = await client.postMediaType(payload, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract ID from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdId = model.id || '';
      if (locationHeader) {
        const idMatch = locationHeader.match(/([0-9a-f-]{36})$/i);
        if (idMatch) {
          createdId = idMatch[1];
        }
      }
      return createToolResult({
        message: "Media type created successfully",
        id: createdId
      });
    } else {
      const errorData: ProblemDetails = response.data || {
        status: response.status,
        detail: response.statusText,
      };
      return createToolResultError(errorData);
    }
  }),
} satisfies ToolDefinition<typeof createMediaTypeSchema.shape, typeof createMediaTypeOutputSchema.shape>;

export default withStandardDecorators(CreateMediaTypeTool);
