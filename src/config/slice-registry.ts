/**
 * Tool slice names that can be assigned to tools.
 * This is the SINGLE SOURCE OF TRUTH for slice names.
 *
 * Slices are assigned explicitly on each tool via the `slices` property.
 * Exported for runtime validation (e.g., checking user config values).
 */
export const toolSliceNames = [
  // CRUD
  'create', 'read', 'update', 'delete',
  // Navigation
  'tree', 'folders',
  // Query
  'search', 'list', 'references',
  // Workflow
  'publish', 'recycle-bin', 'move', 'copy', 'sort', 'validate', 'rename',
  // Information
  'configuration', 'audit', 'urls', 'domains', 'permissions', 'user-status', 'current-user',
  // Entity Management
  'notifications', 'public-access', 'scaffolding', 'blueprints',
  // System
  'server-info', 'diagnostics', 'templates',
] as const;

/**
 * Valid slice names for tool categorization.
 * Derived from toolSliceNames array for compile-time type safety.
 */
export type ToolSliceName = typeof toolSliceNames[number];

/**
 * All valid slice names for configuration validation.
 * Includes 'other' as a catch-all for tools with empty slices arrays.
 */
export const allSliceNames: readonly string[] = [...toolSliceNames, 'other'];

/**
 * Extended slice names including 'other' for catch-all purposes.
 * Tools with empty slices array are always included as 'other'.
 */
export type ExtendedSliceName = ToolSliceName | 'other';
