/**
 * Project-specific constants for this Umbraco MCP Server.
 * Common constants (BLANK_UUID, media types, etc.) are imported from @umbraco-cms/mcp-server-sdk.
 */

// User Group IDs - specific to this Umbraco installation
export const TRANSLATORS_USER_GROUP_ID = "550e8400-e29b-41d4-a716-446655440001";
export const WRITERS_USER_GROUP_ID = "9fc2a16f-528c-46d6-a014-75bf4ec2480c";

// Document Type IDs - specific to this Umbraco installation
export const ROOT_DOCUMENT_TYPE_ID = "a95360e8-ff04-40b1-8f46-7aa4b5983096";
export const CONTENT_DOCUMENT_TYPE_ID = "b871f83c-2395-4894-be0f-5422c1a71e48";

// Member Type IDs
export const Default_Memeber_TYPE_ID = "d59be02f-1df9-4228-aa1e-01917d806cda";

// Data Type IDs
export const TextString_DATA_TYPE_ID = "0cc0eba1-9960-42c9-bf9b-60e150b429ae";
export const MEDIA_PICKER_DATA_TYPE_ID = "4309a3ea-0d78-4329-a06c-c80b036af19a";
export const MEMBER_PICKER_DATA_TYPE_ID = "1ea2e01f-ebd8-4ce1-8d71-6b1149e63548";
export const TAG_DATA_TYPE_ID = "b6b73142-b9c1-4bf8-a16d-e1c23320b549";

// Test helper constants
export const EXAMPLE_IMAGE_PATH =
  "/src/umb-management-api/tools/temporary-file/__tests__/helpers/example.jpg";
