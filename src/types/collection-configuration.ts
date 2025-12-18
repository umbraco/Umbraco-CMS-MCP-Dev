export interface CollectionConfiguration {
  // Collection-level filtering (simplified - no mode needed)
  enabledCollections: string[];  // Collection names to include (if specified, only these load)
  disabledCollections: string[]; // Collection names to exclude (always excluded)

  // Slice-level filtering (filter tools by operation type)
  enabledSlices: string[];   // Slice names to include (if specified, only tools in these slices load)
  disabledSlices: string[];  // Slice names to exclude (tools in these slices never load)

  // Tool-level filtering (existing, enhanced)
  enabledTools: string[];  // Individual tool names to include (if specified, only these load)
  disabledTools: string[]; // Individual tool names to exclude (always excluded)
}

export const DEFAULT_COLLECTION_CONFIG: CollectionConfiguration = {
  enabledCollections: [],
  disabledCollections: [],
  enabledSlices: [],
  disabledSlices: [],
  enabledTools: [],
  disabledTools: [],
};