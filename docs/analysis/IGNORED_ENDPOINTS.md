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

### User Group (3 endpoints)
- `deleteUserGroupByIdUsers` - Remove users from groups (permission escalation risk)
- `postUserGroupByIdUsers` - Add users to groups (permission escalation risk)
- `postUserSetUserGroups` - Set user's group memberships (permission escalation risk)

### User (22 endpoints)
- `postUser` - User creation functionality (account proliferation/privilege escalation risk)
- `deleteUser` - User deletion functionality (denial of service/data loss risk)
- `deleteUserById` - User deletion by ID functionality (denial of service/data loss risk)
- `putUserById` - User update functionality (permission escalation/authentication bypass risk)
- `postUserByIdChangePassword` - Password change functionality (security risk)
- `postUserByIdResetPassword` - Password reset functionality (security risk)
- `postUserCurrentChangePassword` - Current user password change (security risk)
- `postUserByIdClientCredentials` - Client credentials management (security risk)
- `getUserByIdClientCredentials` - Client credentials exposure (security risk)
- `deleteUserByIdClientCredentialsByClientId` - Client credentials manipulation (security risk)
- `getUserById2fa` - 2FA management (security risk)
- `deleteUserById2faByProviderName` - 2FA bypass risk (security risk)
- `getUserCurrent2fa` - 2FA exposure (security risk)
- `deleteUserCurrent2faByProviderName` - 2FA bypass risk (security risk)
- `postUserCurrent2faByProviderName` - 2FA manipulation (security risk)
- `getUserCurrent2faByProviderName` - 2FA exposure (security risk)
- `postUserInvite` - User invitation abuse potential (security risk)
- `postUserInviteCreatePassword` - Invitation hijacking risk (security risk)
- `postUserInviteResend` - Spam/abuse potential (security risk)
- `postUserInviteVerify` - Invitation manipulation (security risk)
- `postUserDisable` - User account lockout risk (security risk)
- `postUserEnable` - Compromised account activation risk (security risk)
- `postUserUnlock` - Account security bypass risk (security risk)

## Total Ignored: 47 endpoints

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

User Group membership endpoints are excluded because:
1. These operations present severe permission escalation risks
2. AI could potentially assign users to administrator groups
3. User group membership changes can compromise system security
4. These sensitive operations should only be performed through the Umbraco UI with proper oversight

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