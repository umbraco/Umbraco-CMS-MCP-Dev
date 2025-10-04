# Test File Format Tool

## Purpose

This experimental tool (`test-file-format`) is designed to test how LLMs pass file data to MCP tools and validate if we can convert it to the `fs.ReadStream` format required by the Umbraco API.

## Problem Context

The `create-temporary-file` tool requires a `ReadStream` as input:

```typescript
export type PostTemporaryFileBody = {
  Id: string;
  File: ReadStream;
};
```

However, it's unclear what format LLMs will use when providing file data through MCP. This test tool explores different possibilities.

## Usage

When calling this tool, provide file content in one or more of these formats:

### Plain String
```json
{
  "fileName": "test.txt",
  "fileAsString": "Hello, World!",
  "mimeType": "text/plain"
}
```

### Base64 Encoded
```json
{
  "fileName": "test.png",
  "fileAsBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "mimeType": "image/png"
}
```

### Data URL
```json
{
  "fileName": "test.png",
  "fileAsDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "mimeType": "image/png"
}
```

### Buffer (if supported)
```json
{
  "fileName": "test.bin",
  "fileAsBuffer": <binary data>,
  "mimeType": "application/octet-stream"
}
```

## What It Tests

1. **Format Detection**: Identifies which format(s) were provided
2. **Type Analysis**: Examines the actual JavaScript type received
3. **Validation**: Validates format-specific aspects (e.g., valid base64, valid data URL)
4. **Conversion**: Attempts to convert to Buffer and then to ReadStream
5. **Verification**: Reads back the stream to verify content integrity

## Output

The tool returns a detailed report including:

- Which formats were provided
- Type analysis for each format
- Conversion success/failure
- File size information
- Content integrity verification
- Any errors encountered

## Cleanup

The tool automatically:
- Creates temporary files in `temp-test-files/` directory
- Cleans up temporary files after testing
- Reports cleanup status

## Next Steps

Based on the test results, we can:
1. Determine which format LLMs naturally use
2. Update `create-temporary-file` to accept that format
3. Add appropriate conversion logic
4. Update the tool's input schema

## Example Test Scenarios

### Test 1: Simple Text File
Ask the LLM: "Use test-file-format tool to test uploading a simple text file with content 'Hello MCP'"

### Test 2: Image File
Ask the LLM: "Use test-file-format tool to test uploading a 1x1 pixel PNG image"

### Test 3: Multiple Formats
Ask the LLM: "Use test-file-format tool and provide the same content in all supported formats"

## Removal

This is a temporary testing tool and should be removed once we understand:
1. What format LLMs use for file data
2. How to properly convert it to ReadStream
3. Have updated the production `create-temporary-file` tool accordingly
