# Universal Media Upload Implementation

## Overview

The media upload system has been redesigned to provide a unified, simplified interface for uploading any type of media file to Umbraco. This simplifies the standard two-step process (create temporary file → create media) with a single tool call that handles all media types.

## Architecture Decision: Single Universal Tool

Instead of creating separate tools for each media type (create-image, create-pdf, create-video, etc.), we implemented a **single universal tool** that:
- Accepts any media type via an explicit `mediaTypeName` parameter
- Trusts the LLM to specify the correct media type based on context
- Only validates SVG files (the one exception where file type matters for technical reasons)
- Supports custom media types created in Umbraco via dynamic API lookup

### Why Trust the LLM?

**Advantages:**
- ✅ LLMs understand semantic context better than file extensions
- ✅ Simpler implementation - no complex extension mapping tables
- ✅ Works seamlessly with custom media types
- ✅ Explicit is better than implicit
- ✅ Dynamic lookup ensures compatibility with any Umbraco installation

**The Only Exception - SVG:**
- SVGs can be mistaken for images by LLMs
- File extension check is simple and reliable for this one case
- Auto-correct prevents technical errors (SVG uploaded as "Image" type fails in Umbraco)

## Tools Implemented

### 1. create-media

**Purpose:** Upload any single media file to Umbraco

**Schema:**
```typescript
{
  sourceType: "filePath" | "url" | "base64",
  name: string,
  mediaTypeName: string,  // Required: explicit media type
  filePath?: string,      // Required if sourceType = "filePath"
  fileUrl?: string,       // Required if sourceType = "url"
  fileAsBase64?: string,  // Required if sourceType = "base64"
  parentId?: string       // Optional: parent folder UUID
}
```

**Supported Media Types:**
- **Image** - jpg, png, gif, webp (supports cropping features)
- **Article** - pdf, docx, doc
- **Audio** - mp3, wav, etc.
- **Video** - mp4, webm, etc.
- **Vector Graphic (SVG)** - svg files only
- **File** - any other file type
- **Custom** - any custom media type name created in Umbraco

**Source Types:**
1. **filePath** - Most efficient, zero token overhead, works with any size file
2. **url** - Fetch from web URL
3. **base64** - Only for small files (<10KB) due to token usage

**Example Usage:**
```typescript
// Upload an image from local filesystem
{
  sourceType: "filePath",
  name: "Product Photo",
  mediaTypeName: "Image",
  filePath: "/path/to/image.jpg"
}

// Upload a PDF from URL
{
  sourceType: "url",
  name: "Annual Report",
  mediaTypeName: "Article",
  fileUrl: "https://example.com/report.pdf"
}

// Upload small image as base64
{
  sourceType: "base64",
  name: "Icon",
  mediaTypeName: "Image",
  fileAsBase64: "iVBORw0KGgoAAAANS..."
}
```

### 2. create-media-multiple

**Purpose:** Batch upload multiple media files (maximum 20 per batch)

**Schema:**
```typescript
{
  sourceType: "filePath" | "url",  // No base64 for batch uploads
  files: Array<{
    name: string,
    filePath?: string,
    fileUrl?: string,
    mediaTypeName?: string  // Optional per-file override, defaults to "File"
  }>,
  parentId?: string  // Optional: parent folder for all files
}
```

**Features:**
- Sequential processing to avoid API overload
- Continue-on-error strategy - individual failures don't stop the batch
- Returns detailed results per file with success/error status
- Validates 20-file batch limit

**Example Usage:**
```typescript
{
  sourceType: "filePath",
  files: [
    { name: "Photo 1", filePath: "/path/to/photo1.jpg", mediaTypeName: "Image" },
    { name: "Photo 2", filePath: "/path/to/photo2.jpg", mediaTypeName: "Image" },
    { name: "Document", filePath: "/path/to/doc.pdf", mediaTypeName: "Article" }
  ],
  parentId: "parent-folder-id"
}
```

