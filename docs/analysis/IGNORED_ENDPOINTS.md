# Ignored Endpoints

These endpoints are intentionally not implemented in the MCP server, typically because they:
- Are related to import/export functionality that may not be suitable for MCP operations
- Have security implications
- Are deprecated or have better alternatives
- Are not applicable in the MCP context

## Ignored by Category

### DocumentType (3 endpoints)
- `getDocumentTypeByIdExport` - Export functionality
- `postDocumentTypeImport` - Import functionality
- `putDocumentTypeByIdImport` - Import functionality

### Dictionary (2 endpoints)
- `getDictionaryByIdExport` - Export functionality
- `postDictionaryImport` - Import functionality

### MediaType (3 endpoints)
- `getMediaTypeByIdExport` - Export functionality
- `postMediaTypeImport` - Import functionality
- `putMediaTypeByIdImport` - Import functionality

### Import (1 endpoint)
- `getImportAnalyze` - Import analysis functionality

### Package (9 endpoints)
- `deletePackageCreatedById` - Delete created package functionality
- `getPackageConfiguration` - Package configuration settings
- `getPackageCreated` - List created packages functionality
- `getPackageCreatedById` - Get created package by ID functionality
- `getPackageCreatedByIdDownload` - Download package functionality
- `getPackageMigrationStatus` - Package migration status functionality
- `postPackageByNameRunMigration` - Run package migration functionality
- `postPackageCreated` - Create package functionality
- `putPackageCreatedById` - Update created package functionality

### Security (4 endpoints)
- `getSecurityConfiguration` - Security configuration settings
- `postSecurityForgotPassword` - Password reset functionality
- `postSecurityForgotPasswordReset` - Password reset confirmation functionality
- `postSecurityForgotPasswordVerify` - Password reset verification functionality

## Total Ignored: 22 endpoints

## Rationale

Import/Export endpoints are excluded because:
1. They typically handle complex file operations that are better managed through the Umbraco UI
2. Import operations can have wide-ranging effects on the system
3. Export formats may be complex and not suitable for MCP tool responses
4. These operations often require additional validation and user confirmation

Package endpoints are excluded because:
1. Package creation and management involve complex file operations
2. Package installation can have system-wide effects requiring careful validation
3. Package migration operations should be handled with caution in the Umbraco UI
4. Download functionality may not be suitable for MCP tool responses

Security endpoints are excluded because:
1. Password reset operations involve sensitive security workflows
2. These operations typically require email verification and user interaction
3. Security configuration changes should be handled carefully through the Umbraco UI
4. Automated security operations could pose security risks if misused