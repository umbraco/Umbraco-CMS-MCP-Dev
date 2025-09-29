# Similar Endpoints for Imaging

## Best Match: Models Builder Collection
- **Similarity**: Simple utility endpoint with minimal complexity - single GET operation, no CRUD operations, no folders/items structure
- **Location**: `/Users/philw/Projects/umbraco-mcp/src/umb-management-api/tools/models-builder/`
- **Copy Strategy**:
  - Copy the simple collection structure from `models-builder/index.ts`
  - Copy the simple test pattern from `models-builder/__tests__/get-models-builder-status.test.ts`
  - Use the same single GET tool pattern

## Alternative Matches:
1. **Searcher/Indexer Collections**: Similar utility endpoints with simple single-purpose operations
2. **Media URL Tools**: Similar media-related URL generation functionality within media collection

## Key Files to Copy:

### Tools:
- **Structure**: `models-builder/index.ts` - Simple collection with no authorization complexity
- **Implementation**: `media/get/get-media-urls.ts` - Similar URL generation pattern but simpler parameters

### Tests:
- **Test Pattern**: `models-builder/__tests__/get-models-builder-status.test.ts` - Simple single test with snapshot
- **No Builders/Helpers Needed**: This is a simple read-only utility endpoint, no complex setup required

## Implementation Strategy:

### 1. Create Imaging Collection Structure
```typescript
// src/umb-management-api/tools/imaging/index.ts
export const ImagingCollection: ToolCollectionExport = {
  metadata: {
    name: 'imaging',
    displayName: 'Imaging',
    description: 'Image resizing and URL generation utilities',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    return [
      GetImagingResizeUrlsTool()
    ];
  }
};
```

### 2. Create Single Tool
```typescript
// src/umb-management-api/tools/imaging/get/get-imaging-resize-urls.ts
const GetImagingResizeUrlsTool = CreateUmbracoTool(
  "get-imaging-resize-urls",
  "Generates resized image URLs for media items with specified dimensions and crop mode",
  getImagingResizeUrlsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getImagingResizeUrls(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
);
```

### 3. Create Single Test
```typescript
// src/umb-management-api/tools/imaging/__tests__/get-imaging-resize-urls.test.ts
const MEDIA_UID = "3c6c415c-35a0-4629-891e-683506250c31";

describe("get-imaging-resize-urls", () => {
  it("should get resized URLs for media item", async () => {
    const result = await GetImagingResizeUrlsTool().handler({
      id: [MEDIA_UID]
    }, { signal: new AbortController().signal });

    expect(result).toMatchSnapshot();
  });
});
```

## Rationale:

1. **Standalone Collection**: Imaging is a specialized utility function, similar to models-builder, searcher, indexer - it doesn't fit naturally into existing collections
2. **Simple Pattern**: No complex CRUD operations, no hierarchical structure, no folders/items - just a single utility endpoint
3. **No Authorization Logic**: The endpoint appears to be a utility function that doesn't require complex permissions (follows models-builder pattern)
4. **No Builders/Helpers**: Since this is a simple read-only endpoint that takes a known UID, no complex test infrastructure is needed
5. **Single Test**: Following the models-builder approach of minimal testing for utility endpoints

## Key Differences from Complex Collections:

- **No CRUD Operations**: Just one GET endpoint
- **No Tree Structure**: No ancestors/children/root operations
- **No Folders**: No folder management
- **No Complex Authorization**: Simple utility access
- **No Builders**: No need for complex test data creation
- **No Validation Logic**: Simple parameter passing

This implementation follows the established pattern for simple utility endpoints while maintaining consistency with the project's architecture.