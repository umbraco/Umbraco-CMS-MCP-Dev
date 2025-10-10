# Media File Path Security Implementation

## Overview

This document describes the security implementation for file path-based media uploads in the Umbraco MCP server.

## Security Vulnerability (Resolved)

### Original Issue
The `create-media` and `create-media-multiple` tools previously accepted arbitrary file paths without validation, allowing potential attackers to:
- Read any file on the server via path traversal attacks (`../../../etc/passwd`)
- Access sensitive files (`.env`, SSH keys, source code, credentials)
- Bypass Umbraco's permission model at the OS level

### Risk Level
**HIGH SEVERITY** - Arbitrary file read vulnerability

## Solution Implemented

### Multi-Layer Defense Strategy

1. **Environment Variable Whitelist** (`UMBRACO_ALLOWED_MEDIA_PATHS`)
   - Comma-separated list of allowed directory paths
   - Must be explicitly configured to enable file path uploads
   - Secure-by-default: File path uploads disabled when not configured

2. **Path Validation** (`validate-file-path.ts`)
   - Normalizes paths to absolute form using `path.resolve()`
   - Prevents path traversal attacks (`../`)
   - Handles symlinks securely (validates symlink targets)
   - Cross-platform support (macOS `/private/tmp` handling)

3. **Clear Error Messages**
   - Guides users to configure `UMBRACO_ALLOWED_MEDIA_PATHS`
   - Lists allowed directories when validation fails
   - Provides security context in tool descriptions

## Configuration

### Environment Variable

```bash
# Enable file path uploads for specific directories
UMBRACO_ALLOWED_MEDIA_PATHS="/tmp/uploads,/var/media,/home/user/assets"
```

### Default Behavior

- **Not configured**: All file path uploads rejected with error
- **Empty string**: All file path uploads rejected with error
- **Configured paths**: Validates against whitelist

### Alternative Source Types

File path uploads are optional. The following alternatives work without configuration:
- **URL uploads**: Fetch files from web URLs
- **Base64 uploads**: Embed file data directly (small files only)

## Implementation Files

### Core Files
- `src/config.ts` - Configuration parsing and validation
- `src/umb-management-api/tools/media/post/helpers/validate-file-path.ts` - Path validation logic
- `src/umb-management-api/tools/media/post/helpers/media-upload-helpers.ts` - Integration point

### Tool Updates
- `src/umb-management-api/tools/media/post/create-media.ts` - Security warnings in schema
- `src/umb-management-api/tools/media/post/create-media-multiple.ts` - Security warnings in schema

### Tests
- `src/umb-management-api/tools/media/post/helpers/__tests__/validate-file-path.test.ts` - 12 comprehensive tests
- `src/umb-management-api/tools/media/__tests__/helpers/media-upload-helpers.test.ts` - Updated with mocks

### Documentation
- `README.md` - Security configuration section added
- `docs/security-plan-media-file-path-whitelisting.md` - Implementation plan

## Security Features

### Path Traversal Prevention
```typescript
// Attack attempt
validateFilePath("/tmp/../../etc/passwd", ["/tmp"])
// Result: Error - not in allowed directory
```

### Symlink Validation
```typescript
// Symlink to allowed path
validateFilePath("/tmp/uploads/safe-link.jpg", ["/tmp/uploads"])
// Result: Allowed if target is within /tmp/uploads

// Symlink to outside path
validateFilePath("/tmp/uploads/malicious-link.jpg", ["/tmp/uploads"])
// Result: Error - symlink target outside allowed directories
```

### Cross-Platform Support
```typescript
// macOS handles /tmp -> /private/tmp automatically
validateFilePath("/tmp/test.jpg", ["/tmp"])
// Result: Allowed (handles /private/tmp resolution)
```

## Testing Coverage

- ✅ Configuration not set rejection
- ✅ Empty configuration rejection
- ✅ Allowed directory validation
- ✅ Outside directory rejection
- ✅ Path traversal prevention
- ✅ Non-existent file handling
- ✅ Relative path normalization
- ✅ Symlink within allowed paths
- ✅ Symlink to outside paths
- ✅ Multiple allowed directories
- ✅ Cross-platform path handling

## Usage Examples

### Secure Configuration

```json
{
  "mcpServers": {
    "umbraco-mcp": {
      "env": {
        "UMBRACO_ALLOWED_MEDIA_PATHS": "/var/www/uploads,/tmp/media-staging"
      }
    }
  }
}
```

### Tool Usage

```typescript
// With configuration set, this works
await createMedia({
  sourceType: "filePath",
  filePath: "/var/www/uploads/image.jpg",
  name: "My Image",
  mediaTypeName: "Image"
});

// Without configuration or invalid path - rejected
await createMedia({
  sourceType: "filePath",
  filePath: "/etc/passwd",  // Rejected!
  name: "Attack",
  mediaTypeName: "File"
});
```

## Deployment Recommendations

### Development
```bash
UMBRACO_ALLOWED_MEDIA_PATHS="/Users/dev/projects/assets,/tmp"
```

### Production
```bash
# Restrict to specific staging directory
UMBRACO_ALLOWED_MEDIA_PATHS="/var/app/media-staging"
```

### Testing
```bash
# Limit to test directories only
UMBRACO_ALLOWED_MEDIA_PATHS="/tmp/test-uploads"
```

## Migration Notes

### Existing Deployments

1. **No immediate action required** - Feature is secure-by-default (disabled)
2. **To enable file path uploads** - Add `UMBRACO_ALLOWED_MEDIA_PATHS` configuration
3. **URL and base64 uploads** - Continue to work without configuration

### Breaking Changes

- File path uploads now require explicit configuration
- Previously working file path uploads will fail with clear error message
- Error message guides users to configuration

## Security Audit

✅ Path traversal prevention implemented
✅ Symlink attack prevention implemented
✅ Secure-by-default configuration
✅ Clear error messages for security failures
✅ Comprehensive test coverage
✅ Documentation updated
✅ Cross-platform support verified

## References

- Original security analysis: `docs/security-plan-media-file-path-whitelisting.md`
- User Group security analysis: `src/umb-management-api/tools/user-group/USER_GROUP_SECURITY_ANALYSIS.md`
