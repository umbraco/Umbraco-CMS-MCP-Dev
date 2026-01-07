import { CollectionConfiguration, DEFAULT_COLLECTION_CONFIG } from "../../types/collection-configuration.js";
import type { UmbracoServerConfig } from "../../config.js";
import { expandModesToCollections, validateModeNames } from "./mode-expander.js";
import { validateSliceNames } from "./slice-matcher.js";

export const CollectionConfigLoader = {
  loadFromConfig: (config: UmbracoServerConfig): CollectionConfiguration => {
    // Start with direct collection includes
    let enabledCollections = config.includeToolCollections ?? [];

    // Expand modes to collections and merge
    if (config.toolModes && config.toolModes.length > 0) {
      // Validate mode names and warn about invalid ones
      const { validModes, invalidModes } = validateModeNames(config.toolModes);

      if (invalidModes.length > 0) {
        console.warn(`Unknown tool modes (ignored): ${invalidModes.join(', ')}`);
      }

      if (validModes.length > 0) {
        // Expand valid modes to collections
        const collectionsFromModes = expandModesToCollections(validModes);

        // Merge with direct includes (deduplicate)
        const allEnabled = new Set([...enabledCollections, ...collectionsFromModes]);
        enabledCollections = Array.from(allEnabled);
      }
    }

    // Handle slice configuration
    let enabledSlices: string[] = [];
    let disabledSlices: string[] = [];

    if (config.includeSlices && config.includeSlices.length > 0) {
      const { valid, invalid } = validateSliceNames(config.includeSlices);
      if (invalid.length > 0) {
        console.warn(`Unknown tool slices (ignored): ${invalid.join(', ')}`);
      }
      enabledSlices = valid;
    }

    if (config.excludeSlices && config.excludeSlices.length > 0) {
      const { valid, invalid } = validateSliceNames(config.excludeSlices);
      if (invalid.length > 0) {
        console.warn(`Unknown tool slices (ignored): ${invalid.join(', ')}`);
      }
      disabledSlices = valid;
    }

    return {
      enabledCollections: enabledCollections.length > 0 ? enabledCollections : DEFAULT_COLLECTION_CONFIG.enabledCollections,
      disabledCollections: config.excludeToolCollections ?? DEFAULT_COLLECTION_CONFIG.disabledCollections,
      enabledSlices,
      disabledSlices,
      enabledTools: config.includeTools ?? DEFAULT_COLLECTION_CONFIG.enabledTools,
      disabledTools: config.excludeTools ?? DEFAULT_COLLECTION_CONFIG.disabledTools,
    };
  }
};
