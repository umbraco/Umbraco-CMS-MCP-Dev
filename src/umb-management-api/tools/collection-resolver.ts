import { ToolCollectionExport } from "types/tool-collection.js";
import { type CollectionConfiguration } from "@umbraco-cms/mcp-server-sdk";

/**
 * Handles collection filtering and dependency resolution.
 */
export const CollectionResolver = {
  /**
   * Validates that all referenced collection names exist in the available collections.
   */
  validateConfiguration: (config: CollectionConfiguration, collections: ToolCollectionExport[]): void => {
    const availableNames = new Set(collections.map(c => c.metadata.name));

    // Check all referenced collection names exist
    const referencedNames = [
      ...config.enabledCollections,
      ...config.disabledCollections,
      ...collections.flatMap(c => c.metadata.dependencies || [])
    ];

    const invalid = referencedNames.filter(name => !availableNames.has(name));
    if (invalid.length > 0) {
      console.warn(`Referenced collections don't exist: ${[...new Set(invalid)].join(', ')}`);
    }
  },

  /**
   * Recursively resolves dependencies for requested collections.
   */
  resolveDependencies: (requestedNames: string[], collections: ToolCollectionExport[]): string[] => {
    const result = new Set(requestedNames);
    const collectionMap = new Map(collections.map(c => [c.metadata.name, c]));

    // Recursively add dependencies
    function addDependencies(collectionName: string) {
      const collection = collectionMap.get(collectionName);
      if (collection?.metadata.dependencies) {
        collection.metadata.dependencies.forEach(dep => {
          if (!result.has(dep)) {
            result.add(dep);
            addDependencies(dep); // Recursive dependency resolution
          }
        });
      }
    }

    requestedNames.forEach(addDependencies);
    return Array.from(result);
  },

  /**
   * Returns enabled collections based on configuration, including resolved dependencies.
   */
  getEnabledCollections: (config: CollectionConfiguration, collections: ToolCollectionExport[]): ToolCollectionExport[] => {
    const allCollectionNames = collections.map(c => c.metadata.name);

    // Apply collection filtering logic (same as tool filtering)
    let enabledNames = allCollectionNames.filter(name => {
      // Always exclude collections in the disabled list
      if (config.disabledCollections.includes(name)) return false;

      // If enabled list exists, only include collections in that list
      if (config.enabledCollections.length > 0) {
        return config.enabledCollections.includes(name);
      }

      // Otherwise, include all collections (default behavior)
      return true;
    });

    // Resolve dependencies - add required collections
    const enabledWithDependencies = CollectionResolver.resolveDependencies(enabledNames, collections);

    return collections.filter(collection =>
      enabledWithDependencies.includes(collection.metadata.name)
    );
  },
};
