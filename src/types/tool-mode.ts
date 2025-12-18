export interface ToolModeDefinition {
  name: string;           // Mode key (e.g., 'content', 'media')
  displayName: string;    // Human readable name
  description: string;    // Mode description
  collections: string[];  // Collection names this mode includes
}
