import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CreateMediaTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import { postMediaTypeBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

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

const CreateMediaTypeTool = CreateUmbracoWriteTool(
  "create-media-type",
  "Creates a new media type",
  createMediaTypeSchema.shape,
  async (model: CreateMediaTypeSchema) => {
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

    const response = await client.postMediaType(payload);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
);

export default CreateMediaTypeTool;
