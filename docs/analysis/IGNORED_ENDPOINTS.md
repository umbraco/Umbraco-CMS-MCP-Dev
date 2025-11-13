# Ignored Endpoints

These endpoints are intentionally not implemented in the MCP server, typically because they:
- Are related to import/export functionality that may not be suitable for MCP operations
- Have security implications
- Are deprecated or have better alternatives
- Are not applicable in the MCP context

## Ignored by Category

### Data Type (1 endpoints)
- `getDataTypeByIdReferencedBy` - Get data type by id referenced by

### Dictionary (2 endpoints)
- `getDictionaryByIdExport` - Get dictionary by id export
- `postDictionaryImport` - Create/Execute dictionary import

### Document (3 endpoints)
- `deleteRecycleBinDocumentById` - Delete recycle bin document by id
- `getItemDocument` - Get item document
- `putUmbracoManagementApiV11DocumentByIdValidate11` - Update umbraco management api v11 document by id validate11

### Document Type (3 endpoints)
- `getDocumentTypeByIdExport` - Get document type by id export
- `postDocumentTypeImport` - Create/Execute document type import
- `putDocumentTypeByIdImport` - Update document type by id import

### Dynamic Root (2 endpoints)
- `getDynamicRootSteps` - Get dynamic root steps
- `postDynamicRootQuery` - Create/Execute dynamic root query

### Help (1 endpoints)
- `getHelp` - Get help

### Import/Export (1 endpoints)
- `getImportAnalyze` - Get import analyze

### Install (3 endpoints)
- `getInstallSettings` - Get install settings
- `postInstallSetup` - Create/Execute install setup
- `postInstallValidateDatabase` - Create/Execute install validate database

### Language (1 endpoints)
- `getLanguage` - Get language

### Media (3 endpoints)
- `deleteRecycleBinMediaById` - Delete recycle bin media by id
- `getItemMediaSearch` - Get item media search
- `putMediaByIdValidate` - Update media by id validate

### Media Type (4 endpoints)
- `getItemMediaType` - Get item media type
- `getMediaTypeByIdExport` - Get media type by id export
- `postMediaTypeImport` - Create/Execute media type import
- `putMediaTypeByIdImport` - Update media type by id import

### Member (1 endpoints)
- `getItemMemberSearch` - Get item member search

### Member Group (1 endpoints)
- `getMemberGroup` - Get member group

### Member Type (1 endpoints)
- `getItemMemberTypeSearch` - Get item member type search

### Object Types (1 endpoints)
- `getObjectTypes` - Get object types

### Oembed (1 endpoints)
- `getOembedQuery` - Get oembed query

### Package (9 endpoints)
- `deletePackageCreatedById` - Delete package created by id
- `getPackageConfiguration` - Get package configuration
- `getPackageCreated` - Get package created
- `getPackageCreatedById` - Get package created by id
- `getPackageCreatedByIdDownload` - Get package created by id download
- `getPackageMigrationStatus` - Get package migration status
- `postPackageByNameRunMigration` - Create/Execute package by name run migration
- `postPackageCreated` - Create/Execute package created
- `putPackageCreatedById` - Update package created by id

### Preview (2 endpoints)
- `deletePreview` - Delete preview
- `postPreview` - Create/Execute preview

### Profiling (2 endpoints)
- `getProfilingStatus` - Get profiling status
- `putProfilingStatus` - Update profiling status

### Published Cache (3 endpoints)
- `getPublishedCacheRebuildStatus` - Get published cache rebuild status
- `postPublishedCacheRebuild` - Create/Execute published cache rebuild
- `postPublishedCacheReload` - Create/Execute published cache reload

### Relation Type (1 endpoints)
- `getItemRelationType` - Get item relation type

### Security (4 endpoints)
- `getSecurityConfiguration` - Get security configuration
- `postSecurityForgotPassword` - Create/Execute security forgot password
- `postSecurityForgotPasswordReset` - Create/Execute security forgot password reset
- `postSecurityForgotPasswordVerify` - Create/Execute security forgot password verify

### Segment (1 endpoints)
- `getSegment` - Get segment

### Telemetry (3 endpoints)
- `getTelemetry` - Get telemetry
- `getTelemetryLevel` - Get telemetry level
- `postTelemetryLevel` - Create/Execute telemetry level

### Upgrade (2 endpoints)
- `getUpgradeSettings` - Get upgrade settings
- `postUpgradeAuthorize` - Create/Execute upgrade authorize

### User (23 endpoints)
- `deleteUser` - Delete user
- `deleteUserById` - Delete user by id
- `deleteUserById2faByProviderName` - Delete user by id2fa by provider name
- `deleteUserByIdClientCredentialsByClientId` - Delete user by id client credentials by client id
- `deleteUserCurrent2faByProviderName` - Delete user current2fa by provider name
- `getUserById2fa` - Get user by id2fa
- `getUserByIdClientCredentials` - Get user by id client credentials
- `getUserCurrent2fa` - Get user current2fa
- `getUserCurrent2faByProviderName` - Get user current2fa by provider name
- `postUser` - Create/Execute user
- `postUserByIdChangePassword` - Create/Execute user by id change password
- `postUserByIdClientCredentials` - Create/Execute user by id client credentials
- `postUserByIdResetPassword` - Create/Execute user by id reset password
- `postUserCurrent2faByProviderName` - Create/Execute user current2fa by provider name
- `postUserCurrentChangePassword` - Create/Execute user current change password
- `postUserDisable` - Create/Execute user disable
- `postUserEnable` - Create/Execute user enable
- `postUserInvite` - Create/Execute user invite
- `postUserInviteCreatePassword` - Create/Execute user invite create password
- `postUserInviteResend` - Create/Execute user invite resend
- `postUserInviteVerify` - Create/Execute user invite verify
- `postUserUnlock` - Create/Execute user unlock
- `putUserById` - Update user by id

### User Group (3 endpoints)
- `deleteUserGroupByIdUsers` - Delete user group by id users
- `postUserGroupByIdUsers` - Create/Execute user group by id users
- `postUserSetUserGroups` - Create/Execute user set user groups

## Total Ignored: 82 endpoints

## Rationale

Import/Export endpoints are excluded because:
1. They typically handle complex file operations that are better managed through the Umbraco UI
2. Import operations can have wide-ranging effects on the system
3. Export formats may be complex and not suitable for MCP tool responses
4. These operations often require additional validation and user confirmation

Install endpoints are excluded because:
1. Installation operations modify core system configuration and should only be performed during initial setup
2. Database validation during installation involves sensitive system checks
3. Installation settings contain system-level configuration that should not be exposed or modified after setup
4. These operations are typically only relevant during the initial Umbraco installation process

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

Telemetry endpoints are excluded because:
1. System telemetry data may contain sensitive system information

User Group membership endpoints are excluded because:
1. These operations present severe permission escalation risks
2. AI could potentially assign users to administrator groups
3. User group membership changes can compromise system security
4. These sensitive operations should only be performed through the Umbraco UI with proper oversight

PublishedCache endpoints are excluded because:
1. Cache rebuild operations can significantly impact system performance and should be carefully timed
2. Cache operations can affect site availability and user experience during execution
3. Cache rebuild status monitoring could expose sensitive system performance information

Upgrade endpoints are excluded because:
1. System upgrade operations involve critical system modifications that could break the installation
2. Upgrade settings contain sensitive system configuration that should not be exposed
3. Upgrade authorization involves system-level changes that require careful oversight
4. These operations are typically only relevant during major version upgrades and should be handled through the Umbraco UI

User endpoints are excluded because:
1. User creation could enable account proliferation and privilege escalation attacks
2. User deletion could cause denial of service by removing critical admin accounts and permanent data loss
3. Password operations could enable account takeover and bypass security controls
4. 2FA management could compromise multi-factor authentication security
5. Client credentials expose sensitive API keys and authentication tokens
6. User invitation system could be abused for spam or unauthorized account creation
7. User state changes (disable/enable/unlock) could be used for denial of service attacks
8. These operations require secure UI flows with proper validation and user confirmation
9. Automated user security operations pose significant risks if misused by AI systems

Profiling endpoints are excluded because:
1. These endpoints control the MiniProfiler, which is a frontend debugging tool for web browsers
2. Profiler activation and status are not relevant for MCP operations that work with data rather than UI
3. The MiniProfiler is designed for developer debugging during web development, not for automated API interactions
4. These operations are frontend-specific functionality that has no use case in the MCP context

Preview endpoints are excluded because:
1. Content preview functionality is designed for frontend website display and user interface interactions
2. Preview operations are primarily used for content editors to see how content will appear on the website
3. These operations are frontend-specific and not relevant for automated data management through MCP

Oembed endpoints are excluded because:
1. oEmbed functionality is used for embedding external media content (videos, social media posts) into rich text editor
2. This is primarily a frontend feature for content display and presentation

Object endpoints are excluded because:
1. Object type enumeration provides internal system metadata about Umbraco's object structure
2. This information is primarily used by the Umbraco backend for internal operations and UI generation

Dynamic endpoints are excluded because:
1. Dynamic root functionality is an advanced configuration feature for creating custom content tree structures
2. These operations are better compled using the UI