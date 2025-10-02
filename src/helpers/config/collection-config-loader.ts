import { CollectionConfiguration, DEFAULT_COLLECTION_CONFIG } from "../../types/collection-configuration.js";
import type { UmbracoServerConfig } from "../../config.js";

export class CollectionConfigLoader {
  static loadFromConfig(config: UmbracoServerConfig): CollectionConfiguration {
    return {
      enabledCollections: config.includeToolCollections ?? DEFAULT_COLLECTION_CONFIG.enabledCollections,
      disabledCollections: config.excludeToolCollections ?? DEFAULT_COLLECTION_CONFIG.disabledCollections,
      enabledTools: config.includeTools ?? DEFAULT_COLLECTION_CONFIG.enabledTools,
      disabledTools: config.excludeTools ?? DEFAULT_COLLECTION_CONFIG.disabledTools,
    };
  }
}