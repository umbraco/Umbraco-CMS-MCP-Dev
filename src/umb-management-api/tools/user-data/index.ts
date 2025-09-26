// User Data Tools - Personal Key-Value Storage for Authenticated Users
//
// User Data provides a secure key-value storage system that allows authenticated users
// to store and retrieve personal configuration, preferences, and application state data.
//
// Key Characteristics:
// - Data is scoped to the currently authenticated user (contextual)
// - Organized by 'group' (category) and 'identifier' (key within category)
// - Persistent storage that survives user sessions
// - Cannot be deleted via safe endpoints (permanent storage)
//
// Common Use Cases:
// - User interface preferences and settings
// - Application-specific configuration data
// - Workflow state and user-specific data
// - Integration settings and API tokens
//
// Data Structure:
// - group: Logical category for organizing related data
// - identifier: Unique key within the group
// - value: The stored data (string format)
// - key: System-generated unique identifier for the record
//
// Security: Data is automatically scoped to the authenticated user making the API call.
// Users cannot access or modify other users' data through these endpoints.

export { default as CreateUserDataTool } from "./post/create-user-data.js";
export { default as UpdateUserDataTool } from "./put/update-user-data.js";
export { default as GetUserDataTool } from "./get/get-user-data.js";
export { default as GetUserDataByIdTool } from "./get/get-user-data-by-id.js";