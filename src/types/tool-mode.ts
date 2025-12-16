export interface ToolModeDefinition {
  name: string;           // Mode key (e.g., 'content', 'editor')
  displayName: string;    // Human readable name
  description: string;    // Mode description
  collections: string[];  // Collection names this mode includes (for base modes)
  modes?: string[];       // Mode names this mode includes (for compound modes)
}
