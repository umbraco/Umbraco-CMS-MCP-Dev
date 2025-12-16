import { ToolModeDefinition } from "../../types/tool-mode.js";

/**
 * Base modes - map directly to collections
 */
export const baseModes: ToolModeDefinition[] = [
  {
    name: 'content',
    displayName: 'Content Management',
    description: 'Document creation, editing, versioning, and blueprints',
    collections: ['document', 'document-version', 'document-blueprint']
  },
  {
    name: 'content-modeling',
    displayName: 'Content Modeling',
    description: 'Document and media structure: types, data types, and content to see the output',
    collections: ['document', 'document-type', 'data-type', 'media', 'media-type']
  },
  {
    name: 'front-end',
    displayName: 'Front-end Development',
    description: 'Templates, partial views, stylesheets, scripts, and static files',
    collections: ['template', 'partial-view', 'stylesheet', 'script', 'static-file']
  },
  {
    name: 'media',
    displayName: 'Media Management',
    description: 'Media library, imaging operations, and file uploads',
    collections: ['media', 'imaging', 'temporary-file']
  },
  {
    name: 'search',
    displayName: 'Search',
    description: 'Examine indexes and search functionality',
    collections: ['indexer', 'searcher']
  },
  {
    name: 'users',
    displayName: 'User Management',
    description: 'Back office users, user groups, and user data',
    collections: ['user', 'user-group', 'user-data']
  },
  {
    name: 'members',
    displayName: 'Member Management',
    description: 'Front-end members, member types, and member groups',
    collections: ['member', 'member-type', 'member-group']
  },
  {
    name: 'health',
    displayName: 'Health & Diagnostics',
    description: 'Health checks and log viewer',
    collections: ['health', 'log-viewer']
  },
  {
    name: 'translation',
    displayName: 'Translation & Localization',
    description: 'Cultures, languages, and dictionary items',
    collections: ['culture', 'language', 'dictionary']
  },
  {
    name: 'system',
    displayName: 'System',
    description: 'Server information, manifest, and models builder',
    collections: ['server', 'manifest', 'models-builder']
  },
  {
    name: 'integrations',
    displayName: 'Integrations',
    description: 'Webhooks, redirects, relations, and tags',
    collections: ['webhook', 'redirect', 'relation', 'relation-type', 'tag']
  }
];

/**
 * Compound modes - expand to other modes
 */
export const compoundModes: ToolModeDefinition[] = [
  {
    name: 'publisher',
    displayName: 'Publisher',
    description: 'Preset for publishers: content, media, and translation tools',
    collections: [],
    modes: ['content', 'media', 'translation']
  },
  {
    name: 'developer',
    displayName: 'Developer',
    description: 'Preset for developers: content modeling, front-end, and system tools',
    collections: [],
    modes: ['content-modeling', 'front-end', 'system']
  },
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Preset for administrators: users, members, health, and system tools',
    collections: [],
    modes: ['users', 'members', 'health', 'system']
  },
  {
    name: 'full',
    displayName: 'Full Access',
    description: 'All available tools',
    collections: [],
    modes: baseModes.map(m => m.name)
  }
];

/**
 * All modes combined
 */
export const allModes: ToolModeDefinition[] = [...baseModes, ...compoundModes];

/**
 * Get all mode names for validation
 */
export const allModeNames: string[] = allModes.map(m => m.name);
