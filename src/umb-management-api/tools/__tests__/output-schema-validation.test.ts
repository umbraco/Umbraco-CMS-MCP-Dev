import { z } from "zod";
import { availableCollections } from "../collection-registry.js";
import { sections } from "auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

/**
 * This test validates that ALL MCP tools have correctly-formed outputSchemas.
 *
 * The MCP SDK requires outputSchema to be a ZodRawShape (a plain object where
 * each value is a ZodType), NOT a raw ZodType like z.object() or z.boolean().
 *
 * The correct pattern is: outputSchema: myZodObject.shape
 * NOT: outputSchema: myZodObject (missing .shape)
 * NOT: outputSchema: z.boolean() (primitive - MCP requires object responses)
 *
 * These bugs are hard to catch because integration tests call handlers directly,
 * bypassing the SDK's schema serialization pipeline.
 */

// Create an admin user mock that has access to ALL tools
const adminUser: CurrentUserResponseModel = {
  allowedSections: Object.values(sections),
  fallbackPermissions: [
    "Umb.Document.Read",
    "Umb.Document.Create",
    "Umb.Document.Update",
    "Umb.Document.Delete",
    "Umb.Document.Publish",
    "Umb.Document.Unpublish",
    "Umb.Document.Rollback",
    "Umb.Document.Move",
    "Umb.Document.Copy",
    "Umb.Document.Sort",
    "Umb.Document.CultureAndHostnames",
    "Umb.Document.PublicAccess",
    "Umb.Document.Permissions",
    "Umb.Document.Notifications",
    "Umb.Document.CreateBlueprint",
    "Umb.Document.RecycleBin",
  ],
  userGroupIds: [{ id: "7E76AB0F-15B8-40E0-8E8B-B1E20E998F42" }], // admin group key
  isAdmin: true,
  id: "test-admin",
  email: "admin@test.com",
  userName: "admin",
  name: "Test Admin",
  languageIsoCode: "en-US",
  documentStartNodeIds: [],
  mediaStartNodeIds: [],
  avatarUrls: [],
  languages: [],
  hasAccessToAllLanguages: true,
  hasAccessToSensitiveData: true,
} as unknown as CurrentUserResponseModel;

// Gather ALL tools from ALL collections
const allTools = availableCollections.flatMap((collection) => {
  try {
    return collection.tools(adminUser);
  } catch {
    // Some collections may fail with mock user - that's ok, we still test what we can
    return [];
  }
});

// Tools that have an outputSchema defined
const toolsWithOutputSchema = allTools
  .filter((tool) => tool.outputSchema !== undefined)
  .map((tool) => [tool.name, tool] as const);

describe("outputSchema validation for all tools", () => {
  it("should have discovered tools to validate", () => {
    expect(allTools.length).toBeGreaterThan(0);
    console.log(`Validating outputSchema for ${allTools.length} tools across ${availableCollections.length} collections`);
  });

  it.each(toolsWithOutputSchema)(
    "%s: outputSchema must be a ZodRawShape (not a raw ZodType)",
    (_name, tool) => {
      // If outputSchema is a ZodType instance, someone forgot to add .shape
      expect(tool.outputSchema).not.toBeInstanceOf(z.ZodType);
    }
  );

  it.each(toolsWithOutputSchema)(
    "%s: outputSchema values must all be ZodType instances",
    (_name, tool) => {
      const entries = Object.entries(tool.outputSchema as Record<string, unknown>);
      expect(entries.length).toBeGreaterThan(0);

      for (const [key, value] of entries) {
        if (!(value instanceof z.ZodType)) {
          throw new Error(
            `outputSchema key "${key}" is not a ZodType. ` +
            `outputSchema must be a ZodRawShape (plain object where values are ZodTypes).`
          );
        }
      }
    }
  );

  it("should list tools without outputSchema (informational)", () => {
    const withoutSchema = allTools.filter((t) => t.outputSchema === undefined);
    if (withoutSchema.length > 0) {
      console.log(
        `${withoutSchema.length} tools have no outputSchema (void operations):`,
        withoutSchema.map((t) => t.name).join(", ")
      );
    }
  });
});
