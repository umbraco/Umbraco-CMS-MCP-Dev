export const BLANK_UUID = "00000000-0000-0000-0000-000000000000";

export const TRANSLATORS_USER_GROUP_ID = "550e8400-e29b-41d4-a716-446655440001";
export const WRITERS_USER_GROUP_ID = "9fc2a16f-528c-46d6-a014-75bf4ec2480c";

export const ROOT_DOCUMENT_TYPE_ID = "a95360e8-ff04-40b1-8f46-7aa4b5983096";
export const CONTENT_DOCUMENT_TYPE_ID = "b871f83c-2395-4894-be0f-5422c1a71e48";
export const Default_Memeber_TYPE_ID = "d59be02f-1df9-4228-aa1e-01917d806cda";
export const TextString_DATA_TYPE_ID = "0cc0eba1-9960-42c9-bf9b-60e150b429ae";
export const MEDIA_PICKER_DATA_TYPE_ID = "4309a3ea-0d78-4329-a06c-c80b036af19a";
export const MEMBER_PICKER_DATA_TYPE_ID = "1ea2e01f-ebd8-4ce1-8d71-6b1149e63548";
export const TAG_DATA_TYPE_ID = "b6b73142-b9c1-4bf8-a16d-e1c23320b549";
// Media Type IDs - hardcoded GUIDs from Umbraco installation
export const FOLDER_MEDIA_TYPE_ID = "f38bd2d7-65d0-48e6-95dc-87ce06ec2d3d";
export const IMAGE_MEDIA_TYPE_ID = "cc07b313-0843-4aa8-bbda-871c8da728c8";
export const FILE_MEDIA_TYPE_ID = "4c52d8ab-54e6-40cd-999c-7a5f24903e4d";
export const VIDEO_MEDIA_TYPE_ID = "f6c515bb-653c-4bdc-821c-987729ebe327";
export const AUDIO_MEDIA_TYPE_ID = "a5ddeee0-8fd8-4cee-a658-6f1fcdb00de3";
export const ARTICLE_MEDIA_TYPE_ID = "a43e3414-9599-4230-a7d3-943a21b20122";
export const VECTOR_GRAPHICS_MEDIA_TYPE_ID = "c4b1efcf-a9d5-41c4-9621-e9d273b52a9c";

// Media Type Names - as they appear in Umbraco
export const MEDIA_TYPE_FOLDER = "Folder";
export const MEDIA_TYPE_IMAGE = "Image";
export const MEDIA_TYPE_FILE = "File";
export const MEDIA_TYPE_VIDEO = "Video";
export const MEDIA_TYPE_AUDIO = "Audio";
export const MEDIA_TYPE_ARTICLE = "Article";
export const MEDIA_TYPE_VECTOR_GRAPHICS = "SVG";

// Mapping for O(1) lookup of standard media types
export const STANDARD_MEDIA_TYPES: Record<string, string> = {
  [MEDIA_TYPE_FOLDER]: FOLDER_MEDIA_TYPE_ID,
  [MEDIA_TYPE_IMAGE]: IMAGE_MEDIA_TYPE_ID,
  [MEDIA_TYPE_FILE]: FILE_MEDIA_TYPE_ID,
  [MEDIA_TYPE_VIDEO]: VIDEO_MEDIA_TYPE_ID,
  [MEDIA_TYPE_AUDIO]: AUDIO_MEDIA_TYPE_ID,
  [MEDIA_TYPE_ARTICLE]: ARTICLE_MEDIA_TYPE_ID,
  [MEDIA_TYPE_VECTOR_GRAPHICS]: VECTOR_GRAPHICS_MEDIA_TYPE_ID,
};

export const EXAMPLE_IMAGE_PATH =
  "/src/umb-management-api/tools/temporary-file/__tests__/helpers/example.jpg";
